import { Promotion } from './types';

export const promotions: Promotion[] = [
  {
    id: 'monthly-offer',
    title: 'ข้อเสนอพิเศษประจำเดือน',
    modelLabel: 'ทุกรุ่น',
    detail: 'รายละเอียดข้อเสนอ ของแถม และเงื่อนไขรอยืนยันจากผู้จำหน่าย',
    validity: 'ระยะเวลา: ข้อมูลรอยืนยัน',
    linkTo: 'models',
  },
  {
    id: 'porta-accessory-package',
    title: 'แพ็กเกจอุปกรณ์เสริม PORTA',
    modelLabel: 'PORTA EV',
    detail: 'ชุดกรุพื้นและกรุผนังสำหรับงานขนส่ง ราคาชุดรอยืนยัน',
    validity: 'ระยะเวลา: ข้อมูลรอยืนยัน',
    linkTo: 'porta',
  },
  {
    id: 'fleet-offer',
    title: 'ข้อเสนอสำหรับลูกค้าองค์กร',
    modelLabel: 'ทุกรุ่น',
    detail: 'เงื่อนไขสำหรับการซื้อจำนวนหลายคัน ติดต่อฝ่ายขายเพื่อจัดข้อเสนอ',
    validity: 'ระยะเวลา: ข้อมูลรอยืนยัน',
    linkTo: 'contact',
  },
];
