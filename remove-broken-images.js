const fs = require('fs');
const path = './dist/assets/index-DgapjE9z.js';
let content = fs.readFileSync(path, 'utf8');

const numbersToRemove = ['01','02','05','06','08','10','11','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','41','42','43'];

let removedCount = 0;
for (const num of numbersToRemove) {
  const regex = new RegExp(
    '\\{id:"static-\\d+",seller_id:"static",name:"Massella G[^"]*",category:"Marka",price:-1,stock:10,description:"",is_active:!0,created_at:new Date\\(\\)\\.toISOString\\(\\),product_images:\\[\\{id:"static-\\d+a",product_id:"static-\\d+",image_url:"/images/Massella_WA_' + num + '\\.jpeg",sort_order:0\\}\\]\\},?',
    'g'
  );
  const before = content.length;
  content = content.replace(regex, '');
  if (content.length !== before) removedCount++;
  else console.log('UYARI: WA_' + num + ' icin eslesme bulunamadi');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Kaldirilan urun sayisi: ' + removedCount + ' / ' + numbersToRemove.length);
