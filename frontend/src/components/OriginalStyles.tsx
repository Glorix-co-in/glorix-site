import { For } from 'solid-js';
// Style elements are owned by each route and removed on navigation. This keeps
// original page-wide selectors from leaking into other pages in the SPA.
export default function OriginalStyles(props: { sheets: string[]; inline?: string }) {
  return <><For each={props.sheets}>{(css) => <style>{css.replace(/url\((['"]?)(?:\.\/)?assets\//g, 'url($1/assets/')}</style>}</For><style>{props.inline || ''}</style></>;
}
