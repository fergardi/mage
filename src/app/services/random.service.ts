import { Injectable } from '@angular/core';
import { sample } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class RandomService {

  constructor() { }

  kingdom(): string {
    const nm1 = ['Ab', 'Abd', 'Ac', 'Ach', 'Act', 'Aeg', 'Aen', 'Agrin', 'Aig', 'Akr', 'Al', 'Am', 'Amar', 'Amb', 'Amph', 'Andr', 'Ank', 'Ant', 'Ap', 'Aph', 'Arg', 'Ars', 'Art', 'As', 'Ask', 'Askl', 'Asp', 'Ass', 'Ast', 'Ath', 'Ayt', 'B', 'Bar', 'Bhryt', 'Bor', 'Bour', 'Bouthr', 'Braur', 'Bubl', 'Byll', 'Byz', 'Cal', 'Car', 'Cebr', 'Ch', 'Chalc', 'Cham', 'Chers', 'Claz', 'Cnid', 'Col', 'Cor', 'Corc', 'Crot', 'Cum', 'Cym', 'Cyr', 'Cyth', 'D', 'Dec', 'Del', 'Delph', 'Dem', 'Did', 'Dim', 'Dios', 'Diosc', 'Dod', 'Dor', 'Dym', 'Ed', 'El', 'Elat', 'Eleut', 'Emp', 'Ep', 'Eph', 'Epid', 'Er', 'Eres', 'Eret', 'Ereth', 'Eretr', 'Erythr', 'Eub', 'G', 'Gangr', 'Gaz', 'Gel', 'Golg', 'Gonn', 'Gorg', 'Gort', 'Gourn', 'Gyth', 'H', 'Hal', 'Hel', 'Hell', 'Hem', 'Hemer', 'Heracl', 'Herm', 'Hier', 'Him', 'Histr', 'Hybl', 'Hyel', 'Ial', 'Ias', 'Id', 'Imbr', 'Iolc', 'It', 'Ith', 'Jukt', 'K', 'Kall', 'Kam', 'Kamar', 'Kameir', 'Kann', 'Kasm', 'Kasmen', 'Kat', 'Kep', 'Kerk', 'Kimm', 'Knid', 'Knoss', 'Kos', 'Kour', 'Kyd', 'Kyr', 'L', 'Lam', 'Lamps', 'Laod', 'Lap', 'Lapith', 'Lar', 'Lat', 'Leb', 'Lefk', 'Leib', 'Leont', 'Lepr', 'Lind', 'Lis', 'Liss', 'M', 'Magn', 'Mall', 'Mant', 'Mar', 'Mass', 'Meg', 'Megal', 'Mes', 'Mess', 'Met', 'Meth', 'Mil', 'Mochl', 'Mon', 'Morg', 'Myl', 'Mynd', 'Myon', 'Myr', 'Myrm', 'Myt', 'N', 'Naucr', 'Naup', 'Nax', 'Neap', 'Nic', 'Nicop', 'Nir', 'Nymph', 'Nys', 'Od', 'Oen', 'Ol', 'Olb', 'Olymp', 'Olynth', 'Onch', 'Or', 'Orch', 'P', 'Pag', 'Pal', 'Pand', 'Pant', 'Paph', 'Par', 'Patr', 'Pavl', 'Peir', 'Pel', 'Pell', 'Perg', 'Pets', 'Phaist', 'Phal', 'Phan', 'Phar', 'Phas', 'Pher', 'Phil', 'Phli', 'Phoc', 'Pin', 'Pis', 'Pith', 'Pix', 'Plat', 'Pos', 'Poseid', 'Pot', 'Prien', 'Prous', 'Ps', 'Psychr', 'Ptel', 'Pydn', 'Pyl', 'Pyrg', 'R', 'Rhamn', 'Rheg', 'Rhith', 'Rhod', 'Rhyp', 'Riz', 'S', 'Sal', 'Sam', 'Scidr', 'Sel', 'Sem', 'Sest', 'Seuth', 'Sic', 'Sid', 'Sin', 'Sit', 'Sklav', 'Smyrn', 'Sol', 'Soz', 'Spart', 'Stag', 'Sten', 'Stymph', 'Syb', 'Syr', 'T', 'Tan', 'Tar', 'Taur', 'Teg', 'Ten', 'Thass', 'Theb', 'Theod', 'Therm', 'Thesp', 'Thor', 'Thron', 'Thur', 'Thyr', 'Tom', 'Tr', 'Trag', 'Trap', 'Trip', 'Troez', 'Tyl', 'Tyliss', 'Tyr', 'Vas', 'Vath', 'Zac', 'Zakr', 'Zancl'];
    const nm2 = ['aca', 'acia', 'aclea', 'actus', 'acus', 'acuse', 'ada', 'ae', 'aea', 'agas', 'agoria', 'agra', 'ai', 'aieus', 'aikastro', 'aion', 'ais', 'aistos', 'aizi', 'ake', 'aki', 'akros', 'alamis', 'ale', 'alia', 'alos', 'amahos', 'ame', 'amea', 'amis', 'amnus', 'amos', 'ampos', 'amum', 'anais', 'ane', 'anes', 'anos', 'anthus', 'antina', 'antium', 'apetra', 'apeze', 'apezus', 'aphos', 'apolis', 'ara', 'arae', 'ares', 'arina', 'aris', 'arnacia', 'arnae', 'arnassus', 'aros', 'arta', 'asa', 'asae', 'aseia', 'assa', 'assus', 'astiraki', 'astro', 'asus', 'ateia', 'athon', 'atis', 'atrae', 'atrea', 'auros', 'aza', 'ea', 'ebes', 'edon', 'egea', 'egion', 'eia', 'eidonia', 'eion', 'eira', 'eiros', 'ekion', 'ela', 'elea', 'eleum', 'elis', 'embria', 'emita', 'ena', 'enae', 'enai', 'endos', 'ene', 'eneia', 'enes', 'enia', 'enimahos', 'enion', 'ens', 'enus', 'eos', 'ephyrian', 'epios', 'era', 'erae', 'erikon', 'erma', 'erna', 'eron', 'eselis', 'esia', 'esmos', 'esos', 'espiae', 'espontos', 'essa', 'essos', 'estias', 'esus', 'ethra', 'etra', 'etri', 'etria', 'etrias', 'etros', 'etta', 'etus', 'eucia', 'eum', 'eus', 'eusis', 'eutherna', 'eze', 'ezus', 'ia', 'iae', 'ias', 'icapaeum', 'icea', 'icos', 'icus', 'icyon', 'ida', 'idaea', 'ide', 'idnae', 'idon', 'idos', 'idrus', 'iene', 'igeneia', 'igona', 'igus', 'ike', 'iki', 'ikon', 'ila', 'ilene', 'iliki', 'illai', 'ina', 'inda', 'ine', 'ini', 'inia', 'inion', 'initida', 'inope', 'inth', 'inus', 'io', 'ioch', 'ion', 'ione', 'iopolis', 'ios', 'ipolis', 'ippi', 'ippia', 'iraki', 'iri', 'is', 'isos', 'issa', 'issos', 'ita', 'itake', 'iteia', 'ithos', 'itida', 'ium', 'iunt', 'ocaea', 'odes', 'odosia', 'oe', 'oezen', 'ofa', 'oinion', 'oinon', 'okampos', 'olgi', 'oli', 'olis', 'ollo', 'ollonia', 'omenion', 'omenus', 'omnos', 'on', 'ona', 'onassa', 'one', 'onesos', 'onia', 'onion', 'onnos', 'ontos', 'ontum', 'ope', 'opeion', 'opetri', 'opolis', 'opus', 'oria', 'oricus', 'orion', 'orus', 'os', 'osia', 'oskopeion', 'osse', 'ossos', 'osthena', 'otiri', 'oton', 'oupoli', 'ous', 'ousa', 'ox', 'oy', 'urias', 'urii', 'urion', 'us', 'ussae', 'ydna', 'ydon', 'ydos', 'ylos', 'yma', 'ymna', 'ympia', 'yn', 'ynthos', 'ynthus', 'ypes', 'yra', 'yras', 'yreum', 'yrgos', 'yria', 'yrian', 'yrna', 'yros', 'ysos', 'ysthenes', 'ystus', 'ythrae', 'ytos'];
    return sample(nm1) + sample(nm2);
  }

  hero(): string {
    let rnd;
    let rnd2;
    const type = Math.random() > 0.5 ? 0 : 1;
    const names1 = ['Ae', 'Aega', 'Aera', 'Aery', 'Bae', 'Baese', 'Balae', 'Dae', 'Daema', 'Daera', 'Gae', 'Gahae', 'Galae', 'Garae', 'Jacae', 'Jae', 'Jaehae', 'Jaere', 'Lae', 'Lucae', 'Ma', 'Mae', 'Maeha', 'Malae', 'Mata', 'Rae', 'Ragae', 'Rahae', 'Rhae', 'Tae', 'Taece', 'Tahae', 'Talae', 'Tyrae', 'Va', 'Vae', 'Vahae', 'Vi', 'Vise', 'Yrae', 'Aer', 'Ag', 'Ar', 'Bael', 'Bar', 'Ber', 'Caen', 'Cal', 'Cel', 'Daer', 'Dal', 'Dor', 'Gael', 'Gal', 'Gon', 'Laen', 'Laer', 'Len', 'Maen', 'Mal', 'Mel', 'Nael', 'Nar', 'Noh', 'Qar', 'Qoh', 'Rael', 'Raen', 'Rah', 'Taen', 'Tael', 'Tar', 'Vael', 'Val', 'Vel'];
    const names2 = ['dar', 'dor', 'gar', 'garon', 'garys', 'gel', 'gon', 'gor', 'lar', 'larr', 'larys', 'lon', 'lor', 'lyx', 'mar', 'marr', 'marys', 'mion', 'mon', 'mond', 'mor', 'morys', 'myx', 'nar', 'narr', 'nor', 'nys', 'nyx', 'raenar', 'rion', 'ron', 'rys', 'var', 'von', 'vor'];
    const names3 = ['Aene', 'Aere', 'Alae', 'Aly', 'Bae', 'Bhae', 'Ba', 'Dae', 'Daene', 'Delae', 'Elae', 'Erae', 'Hae', 'Haele', 'He', 'Jae', 'Jaela', 'Jelae', 'Mae', 'Maele', 'Malae', 'Manae', 'Nae', 'Naela', 'Naere', 'Nelae', 'Nesae', 'Raene', 'Relae', 'Renae', 'Rhae', 'Rhaene', 'Sae', 'Saela', 'Saene', 'Saere', 'Selae', 'Vae', 'Vhae', 'Vyse'];
    const names4 = ['hna', 'hra', 'hrys', 'hnae', 'hra', 'la', 'lys', 'lla', 'lyra', 'mys', 'mala', 'mera', 'na', 'nla', 'nera', 'nna', 'nya', 'nyra', 'nys', 'ra', 'rla', 'rya', 'rys', 'ssa', 'sanne', 'sella', 'sa', 'sys', 'aellis', 'aelor', 'aenor', 'aeris', 'aleos', 'anyon', 'areon', 'daerys', 'eneos', 'ennis', 'eris', 'gaeron', 'garis', 'gyreon', 'iar', 'inarys', 'itheos', 'laeris', 'laeron', 'larys', 'maereon', 'naeros', 'nalys', 'nareon', 'naris', 'raenos', 'ralis', 'reos', 'talor', 'talos', 'taris', 'theon', 'theos', 'tigar', 'yreos'];
    if (type === 1) {
      rnd = Math.floor(Math.random() * names3.length);
      rnd2 = Math.floor(Math.random() * names4.length);
      return names3[rnd] + names4[rnd2];
    } else {
      rnd = Math.floor(Math.random() * names1.length);
      rnd2 = Math.floor(Math.random() * names2.length);
      return names1[rnd] + names2[rnd2];
    }
  }

}
