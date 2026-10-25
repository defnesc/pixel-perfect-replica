import { createFileRoute } from '@tanstack/react-router';
import { CheckPage } from '@/components/site/CheckPage';
import { seo } from '@/lib/seo';
import type { Lang } from '@/i18n';
export const Route=createFileRoute('/$lang/check')({validateSearch:(s:Record<string,unknown>)=>({o:typeof s.o==='string'?s.o:''}),head:({params})=>{const head=seo(params.lang as Lang,'check','/check');return {...head,meta:[...head.meta,{name:'robots',content:'noindex, nofollow'}]};},component:OrderCheck});
function OrderCheck(){const {o}=Route.useSearch();return <CheckPage encoded={o}/>;}
