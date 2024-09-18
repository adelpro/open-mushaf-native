import { TafseerAya, TafseerTabs } from '@/types';

import baghawy from './baghawy.json';
import earab from './earab.json';
import katheer from './katheer.json';
import maany from './maany.json';
import muyassar from './muyassar.json';
import qortoby from './qortoby.json';
import saady from './saady.json';
import tabary from './tabary.json';
import tanweer from './tanweer.json';
import waseet from './waseet.json';

const tafaseerMap: Record<TafseerTabs, TafseerAya[]> = {
  katheer: katheer as TafseerAya[],
  maany: maany as TafseerAya[],
  earab: earab as TafseerAya[],
  baghawy: baghawy as TafseerAya[],
  muyassar: muyassar as TafseerAya[],
  qortoby: qortoby as TafseerAya[],
  tabary: tabary as TafseerAya[],
  saady: saady as TafseerAya[],
  waseet: waseet as TafseerAya[],
  tanweer: tanweer as TafseerAya[],
};

export default tafaseerMap;
