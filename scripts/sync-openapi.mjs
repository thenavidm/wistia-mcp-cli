// Regenerate the shared operation catalogue from a reviewed official release.
// Change the pinned commit only after comparing API eligibility and release notes.
import fs from 'node:fs';
import crypto from 'node:crypto';
import YAML from 'yaml';
const commit='7e5f1ca1e3db2e145357a01afcca8f5e156b8924';
const source=`https://raw.githubusercontent.com/wistia/wistia-cli/${commit}/.speakeasy/out.openapi.yaml`;
const snapshot=new URL('./wistia-api.snapshot.json',import.meta.url);
const proofFile=new URL('../src/tools/api-source.json',import.meta.url);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const previous=fs.existsSync(proofFile)?JSON.parse(fs.readFileSync(proofFile,'utf8')):{};
const refresh=process.argv.includes('--refresh');
let api,upstreamSha256=previous.upstreamSha256;
if(refresh){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error('Official schema fetch: HTTP '+r.status);const raw=await r.text();upstreamSha256=hash(raw);api=YAML.parse(raw);}
else {const raw=fs.readFileSync(snapshot,'utf8');if(previous.sha256&&hash(raw)!==previous.sha256)throw new Error('Snapshot hash mismatch');api=JSON.parse(raw);}
if(api?.info?.version!=='2026.09.0'||!api.paths||!api.components)throw new Error('Expected reviewed stable September schema');
function strip(v){if(Array.isArray(v))v.forEach(strip);else if(v&&typeof v==='object'){delete v.example;delete v.examples;Object.values(v).forEach(strip);}}strip(api);
const snake=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1_$2').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
function clean(v,stack=[]){if(Array.isArray(v))return v.map(x=>clean(x,stack));if(!v||typeof v!=='object')return v;if(v.$ref){if(stack.includes(v.$ref))throw new Error('Circular request schema '+v.$ref);const t=v.$ref.slice(2).split('/').reduce((o,k)=>o?.[k.replace(/~1/g,'/').replace(/~0/g,'~')],api);if(!t)throw new Error('Missing schema reference');return clean({...t,...Object.fromEntries(Object.entries(v).filter(([k])=>k!=='$ref'))},[...stack,v.$ref]);}const o=Object.fromEntries(Object.entries(v).filter(([k])=>!['example','examples','readOnly','writeOnly','xml','discriminator'].includes(k)&&!k.startsWith('x-')).map(([k,x])=>[k,clean(x,stack)]));if(o.allOf?.every(x=>x.type==='object')){o.properties=Object.assign({},...o.allOf.map(x=>x.properties??{}));o.required=[...new Set(o.allOf.flatMap(x=>x.required??[]))];o.type='object';delete o.allOf;}if(o.format==='iso8601')o.format='date-time';return o;}
const aliases={
'GET /account':'get_account','GET /medias/{mediaHashedId}/stats':'get_media_stats','GET /medias/{mediaHashedId}/captions':'list_captions','GET /captions':'list_all_captions','POST /taggings/bulk_create':'bulk_tag','GET /stats/account':'get_account_stats','GET /stats/medias/{mediaId}/engagement':'get_media_engagement','GET /stats/medias/{mediaId}/by_date':'get_media_stats_by_date','GET /background_job_status/{backgroundJobStatusId}':'get_job_status','GET /medias/{mediaHashedId}':'get_media','POST /webinars/{webinarId}/registrations':'create_webinar_registration'};
const operations=[];
for(const[path,item]of Object.entries(api.paths))for(const[method,op]of Object.entries(item)){
 if(!['get','post','put','patch','delete'].includes(method))continue;
 const contents=op.requestBody?.content??{};
 for(const contentType of path==='/'?Object.keys(contents):['application/json']){
 let name=aliases[`${method.toUpperCase()} ${path}`]??snake(op.summary??method+' '+path).replace(/^show_/,'get_');
 const group=snake(op.tags?.[0]??'account');
 if(path==='/')name=contentType==='multipart/form-data'?'upload_media_file':'upload_media';
 if(name.length>64)name=snake(method+' '+group+' '+path.split('/').at(-1));
 if(operations.some(o=>o.name===name))name+='_'+group;
 const bodySchema=clean(contents[contentType]?.schema??{type:'object',properties:{}});
 if(bodySchema.properties){bodySchema.additionalProperties=false;delete bodySchema.properties.access_token;delete bodySchema.properties.api_password;bodySchema.required=(bodySchema.required??[]).filter(k=>!['access_token','api_password'].includes(k));}
 if(contentType==='multipart/form-data')bodySchema.properties.file={type:'string',minLength:1,description:'Absolute regular local file, no symlinks, at most 250 MiB locally. Bytes are sent after explicit confirmation.'};
 const params=[...(item.parameters??[]),...(op.parameters??[])].map(p=>clean(p)).filter(p=>['path','query'].includes(p.in)).map(p=>{let key=snake(p.name);if(bodySchema.properties?.[key])key='target_'+key;const schema=p.schema??{};schema.description=p.description??schema.description;if(p.in==='path'&&schema.type==='string')schema.minLength=1;if(p.name==='page')schema.minimum=1;if(p.name==='per_page')Object.assign(schema,{minimum:1,maximum:100});return {...p,key,schema};});
 const risk=method==='get'||path==='/caption_matches'?'read':'destructive';
 const paginated=method==='get'&&params.some(p=>p.name==='page')&&params.some(p=>p.name==='per_page');
 operations.push({name,title:op.summary+(name==='upload_media_file'?' from a local file':''),description:(op.description??'').replaceAll('—',':').trim()+'\n'+(risk==='read'?'Read-only account operation.':'Requires confirm=true for the requested mutation. May share access, notify people or incur provider charges.'),method:method.toUpperCase(),path,group,risk,params,bodySchema,bodyRequired:!!(op.requestBody?.required||bodySchema.required?.length),paginated,origin:path==='/'?'upload':'modern',contentType});
 }}
if(new Set(operations.map(o=>o.name)).size!==operations.length||operations.some(o=>o.name.length>64))throw new Error('Invalid generated names');
const raw=JSON.stringify(api,null,2)+'\n';
fs.writeFileSync(snapshot,raw);
fs.writeFileSync(new URL('../src/tools/operations.json',import.meta.url),JSON.stringify(operations,null,2)+'\n');
const proof={source,upstreamCommit:commit,officialCliRelease:'v2026.9.0',upstreamSources:['https://wistia.github.io/wistia/api/openapi-modern.yaml','https://wistia.github.io/wistia/api/openapi-upload.yaml'],checked:'2026-10-02',apiVersion:'Modern Data API, X-Wistia-Api-Version: 2026-09',documentVersion:api.info.version,operationCount:operations.length,apiHttpOperations:operations.length-1,sha256:hash(raw),upstreamSha256,corrections:['Stable published September schema is pinned; 25 additional edge HTTP operations are not advertised as stable.','Retain /modern and dated version header; uploader is a separate fixed origin with Bearer header only. Credential body arguments are removed.','Remove all examples; resolve local references, flatten object-only upload allOf, normalize iso8601 format to date-time; retain other current JSON Schema constraints.','Find Caption Matches is a nonmutating POST and remains available in read-only mode. All actual mutations confirm; no POST or mutation retries.','Native request names remain exact, including camelCase folder body fields, legacy upload project_id and modern hashed_ids[] arrays. Per-page local bound is 100.']};
fs.writeFileSync(proofFile,JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({operations:operations.length,reads:operations.filter(o=>o.risk==='read').length+1,tools:operations.length+1,pages:operations.filter(o=>o.paginated).length,source}));
