import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const source='C:/Users/A5IN/Coding/projects/glorix-main';
const target=resolve(import.meta.dirname,'../src/lib/useOriginalAnimations.js');
const main=await readFile(join(source,'main.js'),'utf8');
const common=main.slice(main.indexOf('    // Set initial states for elements'),main.indexOf('    // Email Form Handler'));
function functionBody(text,name){const start=text.indexOf('{',text.indexOf('function '+name));let depth=1,index=start+1;for(;depth&&index<text.length;index++){if(text[index]==='{')depth++;if(text[index]==='}')depth--;}return text.slice(start+1,index-1);}
const bookings=functionBody(await readFile(join(source,'bookings.js'),'utf8'),'initGSAPAnimations').replace('!window.gsapInitialized','true').replace('window.gsapInitialized = true;','');
const gallery=functionBody(await readFile(join(source,'gallery.js'),'utf8'),'initGalleryAnimations');
await writeFile(target,`// Original Glorix animation settings, scoped to a Solid lifecycle.\nimport { onSettled } from 'solid-js';\nimport gsap from 'gsap';\nimport { ScrollTrigger } from 'gsap/ScrollTrigger';\nexport function useOriginalAnimations(page) {\nonSettled(()=>{gsap.registerPlugin(ScrollTrigger);const context=gsap.context(()=>{\nif(page==='bookings'){${bookings}}else if(page==='gallery'){${gallery}}else{${common}\nif(page==='artists'||page==='team'){const grid=page==='team'?'.team-grid':'.artists-grid';gsap.set(grid,{y:50,autoAlpha:0});gsap.to(grid,{scrollTrigger:{trigger:grid,start:'top 75%',once:true},autoAlpha:1,y:0,duration:.6,ease:'power2.out'});}\n}\n});return()=>context.revert();});\n}\n`);
console.log('Reused original page animation settings with lifecycle cleanup.');
