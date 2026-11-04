export type F={k:string;l:string;t?:'text'|'area'|'image'|'file'|'bool'|'cat'|'kind'}
export type C={label:string;title:string;fields:F[];slug?:boolean;pub?:boolean}
const t=(k:string,l:string,x?:F['t']):F=>({k,l,t:x})
export const CFG:Record<string,C>={
 skills:{label:'Skills',title:'name',fields:[t('name','Name'),t('category','Category','cat')]},
 projects:{label:'Projects',title:'title',slug:true,fields:[t('title','Title'),t('slug','Slug (URL)'),t('category','Category'),t('description','Short description','area'),t('details','Details','area'),t('tech','Technologies (comma separated)'),t('image_url','Thumbnail','image'),t('github_url','GitHub URL'),t('demo_url','Live demo URL')]},
 experience:{label:'Experience',title:'position',fields:[t('organization','Organization'),t('position','Position'),t('duration','Duration'),t('description','Description','area'),t('tech','Technologies'),t('image_url','Certificate / image','image')]},
 education:{label:'Education',title:'degree',fields:[t('institution','Institution'),t('degree','Degree'),t('duration','Duration'),t('details','Details','area')]},
 certifications:{label:'Certifications & Achievements',title:'title',fields:[t('title','Title'),t('issuer','Issuer'),t('kind','Type','kind'),t('image_url','Certificate image','image')]},
 posts:{label:'Blog',title:'title',slug:true,fields:[t('title','Title'),t('slug','Slug (URL)'),t('excerpt','Excerpt','area'),t('content','Content','area'),t('cover_url','Cover image','image')]}}
export const PROFILE:F[]=[t('name','Name'),t('title','Professional title'),t('greeting','Hero greeting'),t('intro','Hero introduction','area'),t('photo_url','Hero portrait (transparent PNG works best)','image'),t('about','About','area'),t('education_summary','Academic background','area'),t('interests','Technical interests','area'),t('strengths','Personal strengths','area'),t('resume_url','Resume PDF','file'),t('email','Email'),t('github','GitHub URL'),t('linkedin','LinkedIn URL'),t('twitter','Twitter / X URL'),t('instagram','Instagram URL')]
export const SKILL_CATS=['Programming Languages','Frontend Development','Backend Development','AI & Machine Learning','Data Analytics','Tools & Technologies']
