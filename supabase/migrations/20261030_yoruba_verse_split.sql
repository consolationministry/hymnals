-- Split the remaining unsplit uploaded Yorùbá lyrics using stanza divisions in CONSOLATION HYMNS.
-- This migration changes only array boundaries: every source line and its order are preserved.
-- Targets only uploaded collection rows currently stored as one block; user-added rows are untouched.
BEGIN;

UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitori ti anu Re duro laelae. OD 136:1
Eje k’a f’inu didun,
Yin Oluwa Olore,
Anu Re, O wa titi,
Lododo dajudaju.$verse_split$,
  $verse_split$On nipa agbara Re,
F’ imole s’aye titun,
Anu Re, O wa titi,
Lododo dajudaju.$verse_split$,
  $verse_split$O mbo gbogb’ eda ‘laye,
O npese fun aini won,
Anu Re, O wa titi;
Lododo dajudaju.$verse_split$,
  $verse_split$O bukun ayanfe Re,
Li aginju iparun,
Anu Re, O wa titi,
Lododo dajadaju.$verse_split$,
  $verse_split$Eje k’a f’inu didun,
Yin Oluwa Olore,
Anu Re, O wa titi,
Lododo dajudaju.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30007'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Emi mi si yo si Olorun Olugbala mi. Lk. 1:47
Emi ‘ba n’egberun ahon,
Fun ‘yin Olugbala,
Ogo Olorun Oba mi,
Isegun ore Re.$verse_split$,
  $verse_split$Jesu t’o seru wa d’ayo,
T’o mu banuje tan,
Orin ni l’eti elese,
Iye at’ ilera.$verse_split$,
  $verse_split$O segun agbara ese,
O da onde sile,
Eje Re le w’ eleri mo,
Eje Re seun fun mi.$verse_split$,
  $verse_split$O soro, oku gb’ohun Re,
O gba emi titun,
Onirobinuje y’ayo,
Otosi si gbagbo.$verse_split$,
  $verse_split$Odi, e korin iyin Re,
Aditi, gbohun Re;
Afoju, Olugbala de,
Ayaro, fo f’ayo.$verse_split$,
  $verse_split$Baba mi at’Olorun mi,
Fun mi ni ‘ranwo Re;
Ki nle ro ka gbogbo aye,
Ola oruko Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30009'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oluwa, Olorun mi, Iwo tobi jojo. OD. 104:1
E wole f’Oba, Ologo, julo,
E korin ipa ati ife Re;
Alabo wa ni at’ Eni igbani,
O ngbe ‘nu ogo, Eleru ni iyin.$verse_split$,
  $verse_split$E so t’ipa Re, e so t’ore Re;
‘Mole l’aso Re, gobi Re orun,
Ara ti nsan ni keke ‘binu Re je,
Ipa ona Re ni a ko si le mo.$verse_split$,
  $verse_split$Aye yi pelu ekun ‘yanu Re,
Olorun! Agbara Re l’o da won,
O fi idi re mule, ko si le yi;
O si f’okun se aso igunwa Re.$verse_split$,
  $verse_split$Enu ha le so ti itoju Re?
Ninu afefe ninu imole;
Itoju Re wa nin’ odo ti o nsan,
O si wa ninu iri ati ojo.$verse_split$,
  $verse_split$Awa erupe aw’alailera,
‘Wo l’a gbekele, O ki o da ni,
Anu Re rorun o si le de opin,
Eleda, Alabo, Olugbala wa.$verse_split$,
  $verse_split$‘Wo Alagbara Onife julo,
B’awon angeli ti nyin O loke,
Be l’awa eda Re, niwon t’a le se,
A o ma juba Re, a o ma yin O.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30010'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E fi iyin fun Oluwa. OD. 106:1
Fi iyin fun Jesu, Olurapada wa,
Ki aye k’ okiki ife Re nla,
Fi iyin fun! Eyin Angeli ologo,
F’ola at’ogo fun oruko Re;
B’Olus’agutan, Jesu y’o to Omo Re,
L’apa Re l’o ngbe won le l’ojojo;
Eyin eniyan mimo ti ngb’oke Sion;
Fi iyin fun pelu orin ayo.$verse_split$,
  $verse_split$Fi iyin fun, Jesu Olurapda wa,
Fun wa, O t’eje Re sile, O ku,
On ni apata, ati reti ‘gbala wa,
Yin Jesu ti a kan m’agbalebu;
Olugbala t’O f’ara da irora nla,
Ti a fi ade egun de l’ori,
Eniti a pa nitori awa eda,
Oba ogo njoba titi laelae.$verse_split$,
  $verse_split$Fi iyin fun, Jesu Olurapada wa,
Ki ariwo iyin gba orun kan,
Jesu Oluwa njoba lae ati laelae,
Se l’Oba gbogb’ eyin alagbara;
A segun iku; fi ayo royin na ka,
Isegun re ha da, isa oku?
Jesu ye ko tun si wahala fun wa mo,
‘Tori O l’agbara lati gbala.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30011'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Fi ibukun fun Oluwa, Iwo okan mi. OD. 103:1
Okan mi yin Oba orun,
Mu ore wa sode Re,
‘Wo ta wosan, t’a dariji
Tal’ aba ha yin bi Re?
Yin Oluwa, Yin Oluwa,
Yin Oba Ainipekun.$verse_split$,
  $verse_split$Yin fun anu t’o fi han
F’awon Baba ‘nu ponju;
Yin I Okan na ni titi
O lora lati binu,
Yin Oluwa, Yin Oluwa,
Ologo n’nu otito.$verse_split$,
  $verse_split$Bi Baba ni O ntoju wa,
O si mo ailera wa;
Jeje l’o ngbe wa lapa Re,
O gba wa lowo ota,
Yin Oluwa, Yin Oluwa,
Anu Re, yi aye ka.$verse_split$,
  $verse_split$A ngba b’itanna eweko,
T’afefenfe, t’o si nro,
‘Gbati a nwa ti a si nku,
Olorun wa bakanna;
Yin Oluwa, Yin Oluwa,
Oba Alainipekun.$verse_split$,
  $verse_split$Angel, e jumo ba wa bo,
Eyin nri lojukoju,
Orun, Osupa, e wole;
Ati gbogbo agbaye,
E ba wa yin, E ba wa yin,
Olorun Olotito.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30012'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E korin titun si Oluwa; nitori O ti se ohun iyanu. OD 98:1
Eyin Oba Ogo, On ni Olorun,
Yin I fun ‘se ‘yanu ti O ti fi han,
O wa pel’ awon ero mimo l’ona,
O si je imole won l’osan l’oru.$verse_split$,
  $verse_split$EGBE:
Eyin angeli didan lu duru wura,
Ki gbogbo nyin juba t’e nwo oju Re,
Ni gbogbo ‘joba Re, b’aye ti nyi lo,
Ise Re y’o ma yin,
Ise Re y’o ma yin,
Fi ibukun fun Oluwa okan mi.$verse_split$,
  $verse_split$Eyin fun ‘rapada, ti gbogbo okan,
Eyin fun orisun imularada,
Fun inu rere ati itoju Re,
Fun ‘daniloju pe, O ngbo adura.$verse_split$,
  $verse_split$EGBE:
Eyin angeli didan lu duru wura,
Ki gbogbo nyin juba t’e nwo oju Re,
Ni gbogbo ‘joba Re, b’aye ti nyi lo,
Ise Re y’o ma yin,
Ise Re y’o ma yin,
Fi ibukun fun Oluwa okan mi.$verse_split$,
  $verse_split$Eyin fun idanwo, bi okun ife,
T’o nso wa po mo awon ohun orun,
Fun ‘gbagbo ti nsegun ‘reti ti ki sa,
Fun ile Ogo t’O ti pese fun wa.$verse_split$,
  $verse_split$EGBE:
Eyin angeli didan lu duru wura,
Ki gbogbo nyin juba t’e nwo oju Re,
Ni gbogbo ‘joba Re, b’aye ti nyi lo,
Ise Re y’o ma yin,
Ise Re y’o ma yin,
Fi ibukun fun Oluwa okan mi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30013'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E fi ogo fun Oluwa. OD. 29:2.
Ogo ni f’Oluwa to se ohun nla,
Ife lo mu k’O fun wa ni Omo Re,
Enit’O f’emi Re lele f’ese wa;
To si silekun iye sile fun wa.$verse_split$,
  $verse_split$EGBE:
Yin Oluwa, Yin Oluwa,
F’iyin fun Oluwa,
Yin Oluwa, Yin Oluwa,
E yo niwaju Re,
Ka to Baba wa lo l’Oruko Jesu,
Je k’a jo f’ogo fun Onise-yanu.$verse_split$,
  $verse_split$Irapada kikun ti eje Re ra,
F’enikeni t’o gba ileri Re gbo,
Enit’o buruju b’o ba le gbagbo,
Lojukanna y’o ri idariji gba.$verse_split$,
  $verse_split$EGBE:
Yin Oluwa, Yin Oluwa,
F’iyin fun Oluwa,
Yin Oluwa, Yin Oluwa,
E yo niwaju Re,
Ka to Baba wa lo l’Oruko Jesu,
Je k’a jo f’ogo fun Onise-yanu.$verse_split$,
  $verse_split$O s’ohun nla fun wa, O da wa l’ola,
Ayo wa di kikun ninu Omo Re,
Ogo ati ewa irapada yi,
Y’o ya wa lenu ‘gbat’ a ba ri Jesu.$verse_split$,
  $verse_split$EGBE:
Yin Oluwa, Yin Oluwa,
F’iyin fun Oluwa,
Yin Oluwa, Yin Oluwa,
E yo niwaju Re,
Ka to Baba wa lo l’Oruko Jesu,
Je k’a jo f’ogo fun Onise-yanu.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30015'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Kili emi o fi fun Oluwa, nitori gbogbo ore Re simi? OD 116:12
Fun anu t’o po b’iyanrin,
Ti mo ngba lojumo;
Lat’ odo Jesu Oluwa;
Ki l’emi o fi fun?$verse_split$,
  $verse_split$Kini un o fi fun Oluwa,
Lat’ inu okan mi?
Ese ti ba gbogbo re je,
Ko tile jamo nkan.$verse_split$,
  $verse_split$Eyi l’ohun t’emi o se
F’ohun t’O se fun mi:
Em’o mu ago igbala,
Uno kepe Olorun.$verse_split$,
  $verse_split$Eyi l’ope ti mo le da,
Emi osi, are;
Em’o ma soro ebun Re,
Uno si ma bere si.$verse_split$,
  $verse_split$Emi ko le sin bo ti to,
Nko n’ise kan to pe,
Sugbon em’o sogo yi pe,
Gbese ope mi po.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30016'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oro na si di ara, on si mba wa gbe, awa si nwo ogo re, ogo bi ti Omo bibi kansoso lati odo Baba wa, o kun fun ore-ofe ati otito. – Jn. 1:14.
EGBE:
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga;
Eni ba more Re k’o ba wa gbe ga,
Eni ba more Re k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga.$verse_split$,
  $verse_split$Eni t’O f’orun sile t’O wa s’aye,
Lati ku fun ese araye gbogbo;
E korin Aleluya s’Oba mimo,
Eni ba more Jesu k’o ba wa gbe ga.$verse_split$,
  $verse_split$EGBE:
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga;
Eni ba more Re k’o ba wa gbe ga,
Eni ba more Re k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga.$verse_split$,
  $verse_split$Eni t’O npa wa mo o, lojojumo,
Eni t’O nyo wa ninu ewu gbogbo,
Eni t’O npa Israeli mo k’itogbe;
Eni ba more Jesu k’o ba wa gbe ga.$verse_split$,
  $verse_split$EGBE:
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga;
Eni ba more Re k’o ba wa gbe ga,
Eni ba more Re k’o ba wa gbe ga,
E ba wa yin Oluwa, Aleluya!
Eni ba more Jesu k’o ba wa gbe ga.$verse_split$,
  $verse_split$Eni t’O npese fun aini wa l’aye,
Eni t’O nsore fun wa l’ojo gbogbo,
Ore t’O nse fun wa ko l’onka rara;
Eni ba more Jesu k’o ba wa gbe ga.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30018'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Emi o ma yo ninu Olorun igbala mi. – Hab. 3:18.
Okan mi yin Oluwa logo,
Oba iyanu t’O wa mi ri:
Uno l’agogo iyin y’aye ka,
Uno si fife Atobiju han.$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Bi eranko l’emi ba segbe,
Bikose ti Oyigiyigi;
Lairotele l’Emi Mimo de;
T’O f’ede titun si mi l’enu.$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Ayo okan mi ko se rohin,
Loro, losan, loganjo oru;
Gbat’ Emi Mimo ti de ‘nu mi;
Mo nkorin orun lojojumo.$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Jesu ti la mi loju emi,
Mo si f’eti gbohun ijinle;
O nse faji ninu okan mi;
Kini mba fi fun Olugbala?$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Em’o sogo ninu Oluwa,
K’emi ma ba di alaimore;
B’O ti pe mi iyanu l’o je,
Awon angel d’olulufe mi.$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Mo damure lati sin Jesu,
Lai f’ota pe larin aye yi;
Nibikibi t’O ba nto mi si,
O daju ko ni jeki ndamu.$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Bi mba pari ‘re-ije l’aye,
Olugbala, ma je ki npofo;
Ni wakati na jeki ngbo pe,
Bo sinu ayo ayeraye.$verse_split$,
  $verse_split$EGBE:
Oluwa, ope ni fun O,
Fun ore-ofe t’O fi yan mi,
Jowo dimi mu titi dopin;
Ki nle joba pelu Re loke.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30019'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Je ki gbogbo eniyan ki o yin O. OD. 67:3.
Gbe Oluwa ga pelu mi,
Eyin eniyan Re,
Ki gbogbo eda alaye;
Ma yo l’oruko Re,
Fun ife ti O nfihan,
Fun isimi l’okan wa,
Fun igbala kikun Re,
Tire l’ope.$verse_split$,
  $verse_split$EGBE:
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko;
Oluwa wa titi laelae,
Ani, titi laelae,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko,
Oluwa wa,
Titi laelae.$verse_split$,
  $verse_split$Eyin fun iwa-mimo Re,
Fun ore-ofe Re,
Korin iyin fun eje Re,
To fi ra wa pada;
Ife lo fi wa wa ri,
Ninu ira ese wa,
O f’ona iye han wa,
E fope fun.$verse_split$,
  $verse_split$EGBE:
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko;
Oluwa wa titi laelae,
Ani, titi laelae,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko,
Oluwa wa,
Titi laelae.$verse_split$,
  $verse_split$Emi ‘ba l’egberun ahon,
Nko le royin na tan;
Ife Re si mi po jojo,
Ago ‘bukun mi nkun,
Ore-ofe ti ki ye,
Alafia bi odo,
Lat’ odo Olubukun;
E fope fun.$verse_split$,
  $verse_split$EGBE:
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko;
Oluwa wa titi laelae,
Ani, titi laelae,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa f’ope fun,
Ki gbogbo wa yin oruko,
Oluwa wa,
Titi laelae.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30020'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ki iru awon ti of fe igbala re ki o ma wi nigbagbogbo pe: “Ki a gbe Olorun ga. OD. 70:4.
Oba ogo, alafia,
Un o feran Re;
Ife na ki y’o dekun,
Un o sunmo O;
N’tori O ti gbebe mi,
O ti gb’ohun mi;
O ka iwe aya mi,
O da mi n’de.$verse_split$,
  $verse_split$Fun idasile yi ni
Uno korin Re;
Gbogb’ayo okan mi ni
Uno mu fun O;
‘Gba t’ese mi nke kikan,
O da mi lare:
‘Gba mo pe O nikoko,
O gbebe mi.$verse_split$,
  $verse_split$Gbogb’ojo aye mi ni
Uno fi yin O;
Mo le gbe O ga ninu
Okan mi yi:
Aye wa n’nu okan mi
T’Iwo y’o ma gbe!
Ayeraye kuru ju
Lati yin O.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30021'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Eni ti o fe wa, ti o si we wa ninu eje Re A uro ninu ese wa: Tire li ogo ati ijoba lae ati lae: Amin. Ifi.1:5-6.
Gbo orin awon ayanfe,
Orin iyin titun;
T ‘Od’agutan t’a se logo,
Eyi ni orin won.$verse_split$,
  $verse_split$EGBE:
Ogo f’Eni to fe wa,
To f’eje Re we wa,
To w’ese at’ebi wa nu,
Nibi ‘san iye ni.$verse_split$,
  $verse_split$A fo aso wa n’n’eje Re,
O si funfun laulau;
Imole t’O tan s’okan wa,
F’ipa oto Re han.$verse_split$,
  $verse_split$A segun nipa eje Re,
‘Gba t’ esu gbogun de,
Agbara otito Kristi,
Lo f’okun s’apa wa.$verse_split$,
  $verse_split$Ka juba Od’agutan na,
Baba ‘ye on mole,
Tire l’ogo, ola, ipa,
‘Joba at’ agbara.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30022'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Emi ti kara mi yio si ji ni kutukutu. OD 108:2
Ji Okan mi, ba orun ji,
Mura si ise ojo Re.
Mase ilora, ji kutu.
K’o san ‘gbese ebo oro.$verse_split$,
  $verse_split$Ro gbogb’ojo t’o fi sofo,
Bere si rere ‘se loni,
Kiyesi ‘rin re l’aye yi,
Ko si mura d’ojo nla ni.$verse_split$,
  $verse_split$K’oro re gbogbo j’otito,
K’okan re mo b’osan gangan,
Mo p’Olorun nso ona re,
O mo ero ikoko re.$verse_split$,
  $verse_split$Nipa ‘mole ti nt’roun wa,
Tan ‘mole na f’elomiran;
Jeki ogo Olorun ‘han,
Ninu ife at’orun yin.$verse_split$,
  $verse_split$Ji, gbonranu ‘wo okan mi,
Yan ipo re l’arin angeli’,
Awon ti won nkorin iyin,
Ni gbogbo igba s’Oba wa.$verse_split$,
  $verse_split$Mo ji, mo ji, ogun orun,
Ki isin yin s’okan mi ji,
Ki nle lo ojo aye mi,
Fun Olorun mi bi ti yin.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30023'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ma rin niwaji mi, ki iwo ki o si pe. Gen. 17:1
Oluwa mi, mo njade lo,
Lati se ise onjo mi;
Iwo nikan l’emi o mo,
Loro, lero, ati n’ise.$verse_split$,
  $verse_split$Ise t’o yan mi l’anu Re,
Jeki nle se tayo tayo,
Ki nr’oju Re n’nu ise mi,
K’emi si le fi ‘fe Re han.$verse_split$,
  $verse_split$Dabobo mi lowo danwo,
K’opa okan mi mo kuro;
Lowo aniyan aye yi,
Ati gbogbo ifekufe.$verse_split$,
  $verse_split$Iwo t’oju Re r’okan mi,
Ma wa l’ow’otun mi titi,
Ki nma sise lo l’ase Re,
Ki nf’ise mi gbogbo fun O.$verse_split$,
  $verse_split$Je ki nreru Re t’o fuye,
Ki nma sora nigba gbogbo
Ki nma f’oju si nkan t’orun
Ki nsi mura d’ojo’ogo.$verse_split$,
  $verse_split$Ohunkohun t’O fi fun mi,
Je ki nle lo fun ogo Re,
Ki n f’ayo sure ije mi,
Ki nba O rin titi d’orun.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30024'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Li ale, li owuro, ati li osan li emi o ma gbadura. – OD 55:17
Wa s’adura ooro,
Kunle k’a gbadura,
Adura ni opa Kristian,
Lati b’Olorun rin.$verse_split$,
  $verse_split$L’osan, wole labe,
Apat’ayeraye,
Itura ojiji Re dun,
Nigba t’orun ba mu.$verse_split$,
  $verse_split$Je ki gbogbo ile,
Wa gb’adura l’ale;
Ki ile wa di t’Olorun
Ati ‘bode orun.$verse_split$,
  $verse_split$Nigbat’ od’oganjo,
Je k’a wi l’emi pe,
Mo sun, sugbon okan mi ji,
Lati ba O s’ona.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30025'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Gbo ekun mi, Olorun; fiyesi adura mi. OD 61:1
Baba mi, gbo t’emi,
‘Wo ni alabo mi,
Ma sun mo mi titi,
Oninure Julo.$verse_split$,
  $verse_split$Kristi Oluwa mi,
Iye at’ogo mi,
Ki ‘gba naa yara de,
Ti un o de odo Re.$verse_split$,
  $verse_split$Olutunnu julo,
‘Wo ti ngbe inu mi,
‘Wo t’O mo aini mi,
Fa mi, k’O si gba mi,$verse_split$,
  $verse_split$Mimo, Mimo, Mimo,
Ma fi mi sile lae,
Se mi ni bugbe Re,
Tire nikan laelae.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30026'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ba wa duro: nitori o di ojo ale. Lk 24:29
Wa ba mi gbe, ale fere le tan;
Okunkun nsu, Oluwa ba mi gbe,
Bi Oluranlowo, miran ba ye,
Iranwo alaini, Wa ba mi gbe.$verse_split$,
  $verse_split$Ojo aye mi nsare lo s’opin,
Ayo aye nku, ogo re nwomi,
Ayida at’ibaje ni mo n ri,
‘Wo ti ki yipada, wa ba mi gbe.$verse_split$,
  $verse_split$Ma wa l’eru b’Oba awon oba,
B’oninure, wa pelu ‘wosan Re,
Ki O si ma kanu fun egbe mi,
Wa, Ore elese, wa ba mi gbe.$verse_split$,
  $verse_split$Mo nfe O ri, ni wakati gbogbo,
Kilo le segun esu b’ore Re?
Tal’o le se amona mi bi Re?
N’nu ‘banuje at’ayo ba mi gbe.$verse_split$,
  $verse_split$Pelu ‘bukun Re, eru ko ba mi,
Ibi ko wuwo, ekun ko koro,
Oro iku da? Segun isa da?
Un o segun sibe, b’Iwo ba mi gbe.$verse_split$,
  $verse_split$Wa ba mi gbe, ni wakati iku,
Se ‘mole mi si toka si orun,
B’aye ti nkoja, k’ile orun mo,
Ni yiye, ni kiju, wa ba mi gbe.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30027'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nigbati iwo ba sun, yio ma so O. Owe 6:22
Ogo f’Olorun l’ale yi
Fun gbogbo ore Imole,
So mi, Oba awon Oba;
L’abe ojiji iye Re.$verse_split$,
  $verse_split$Oluwa f’ese mi ji mi,
Nitori omo Re, loni
K’emi le wa l’a alafia,
Pelu iwo ati aye.$verse_split$,
  $verse_split$Je k’okan mi le sun le O,
K’orun didun p’oju mi de,
Orun ti y’o m’ara mi le,
Ki nle sin O li owuro.$verse_split$,
  $verse_split$Bi mo ba dubule laisun,
F’ero orun kun okan mi,
Ma je ki nl’ala bururu,
Ma je k’ipa okun bo mi.$verse_split$,
  $verse_split$Yin Olorun, Ibu ore;
E yin, eyin eda aye,
E yin, eyin eda Orun,
Yin Baba, Omo on Emi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30028'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E ma ba ara nyin soro ninu psalmu, ati orin iyin ati orin Emi. Efe. 5:1
Ko su wa lati ma ko orin igbani,
Ogo f’Olorun Aleluya!
A le fi igbagbo korin na s’oke kikan.
Ogo f’Olorun, Aleluya.$verse_split$,
  $verse_split$EGBE:
Omo Olorun ni eto lati bu s’ayo
Pe ona yi nye wa si,
Okan wa ns’aferi Re;
Nigb’o se a o de afin Oba wa Ologo
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$Awa mbe n’nu ibu ife t’o ra wa pada,
Ogo f’Olorun Aleluya!
Awa y’o fi iye goke lo s’oke orun;
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$EGBE:
Omo Olorun ni eto lati bu s’ayo
Pe ona yi nye wa si,
Okan wa ns’aferi Re;
Nigb’o se a o de afin Oba wa Ologo
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$Awa nlo si afin kan ti a fi wura ko,
Ogo f’Olorun Aleluya!
Nibiti ao ri Oba Ogo n’nu ewa Re,
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$EGBE:
Omo Olorun ni eto lati bu s’ayo
Pe ona yi nye wa si,
Okan wa ns’aferi Re;
Nigb’o se a o de afin Oba wa Ologo
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$Nibe ao korin titun t’anu t’O da wa nde,
Ogo f’Olorun Aleluya!
Nibe awon ayanfe yo korin ‘yin ti Krist;
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$EGBE:
Omo Olorun ni eto lati bu s’ayo
Pe ona yi nye wa si,
Okan wa ns’aferi Re;
Nigb’o se a o de afin Oba wa Ologo
Ogo f’Olorun, Aleluya!$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30029'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oni li ojo isimi fun Oluwa. Eks. 16:25
Jesu, a fe pade,
L’ojo Re mimo yi;
A si y’Ite Re ka,
L’ojo Re mimo yi;
Wo ore wa orun,
Adura wa mbo wa,
Bojuwa emi wa,
L’ojo Re mimo yi.$verse_split$,
  $verse_split$A ko gbodo lora,
L’ojo Re mimo yi,
Li eru a kunle,
L’ojo Re mimo yi;
Ma to gbogb’ ero wa,
K’Iwo k’o si ko wa,
K’a sin O b’o ti ye,
L’ojo Re mimo yi.$verse_split$,
  $verse_split$A teti s’oro Re,
L’ojo Re mimo yi,
Bukun oro t’a gbo,
L’ojo Re mimo yi,
Ba wa lo ‘gba t’a lo,
F’ore igbala Re;
Si aya wa gbogbo,
L’ojo Re mimo yi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30030'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Yio si dabi imole oro nigbati orun ba la ati ti ko ni kuku. I Sam. 23:4
Ojo mole l’eyi,
Ki ‘mole wa loni,
‘Wo orun ran s’okunkun wa,
K’o si le oru lo.$verse_split$,
  $verse_split$Ojo ‘simi l’eyi,
S’agbara wa d’otun,
S’ori aibale aya wa;
Se ‘ri itura Re.$verse_split$,
  $verse_split$Ojo alafia,
F’alafia fun wa:
Da iyapa gbogbo duro,
Si mu ija kuro.$verse_split$,
  $verse_split$Ojo adura ni;
K’aye sunmo orun;
Gb’okan wa s’oke sodo Re,
Si pade wa nihin.$verse_split$,
  $verse_split$Oba ojo l’eyi;
Fun wa ni isoji;
Ji oku okan wa s’ife;
‘Wo asegun iku.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30031'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ojo keje li ijo isimi Oluwa Olorun Re. Eks. 20:10
Ose, oso rere,
Iwo ojo simi;
O ye k’a fi ojo kan
Fun Olorun rere;
B’ojo mi ba m’ekun wa,
Iwo n’ oju wa nu;
Iwo ti s’ojo ayo,
Emi fe dide re$verse_split$,
  $verse_split$Ose Ose rere,
A k’yo sise loni;
A o f’ise wa gbogbo
Fun aisimi ola,
Didan l’oju re ma dan,
‘Wo arewa ojo;
Ojo mi nso ti lala,
Iwo nso ti simi.$verse_split$,
  $verse_split$Ose, Ose rere
Ago tile nwipe,
F’Eleda re l’ojo kan,
T’O fun o n’ijo mefa;
A o fi ‘se wa sile,
Lati lo sun nibe
Awa ati ore wa;
Ao lo sile adua$verse_split$,
  $verse_split$Ose, Ose rere,
Wakati re wu mi;
Ojo orun ni ‘wo se;
“Wo apere orun;
Oluwa, je ki njogun
‘Simi leyin iku;
Ki nle ma sin O titi,
Pelu eniyan Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30032'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Eyipada kuro ninu ona buburu nyin; nitori kini eyin o se ku. Esek. 33:11
Elese, e yipada,
Ese ti e o fi ku?
Eleda yin ni mbere,
Tofeki e ba On gbe;
Oran nla ni O mbi yin,
Ise owo Re ni yin;
A! Eyin alailope,
Ese t’ e o ko ‘fe Re?$verse_split$,
  $verse_split$Elese e yi pada,
Ese ti o o fi ku?
Olugbala ni mbere;
Eni t’O gb’emi yin la;
Iku Re y’o j’asan bi?
E o tun kan mo ‘gi bi?
Eni ‘rapada ese,
Te o gan or’ofe Re?$verse_split$,
  $verse_split$Elese, e yi pada,
Ese ti e o fi ku?
Emi mimo ni mbere,
Ti nfojo gbogbo ro yin;
E ki o ha gb’ore Re?
E o ko iye sibe?
Ati nwa yin pe, ese,
T’e mbi Olorun ninu?$verse_split$,
  $verse_split$Iyemeji ha nse yin,
Pe ife ni Olorun,
E ki o ha gboro Re?
K’e gba ileri Re gbo?
W’Oluwa lodo yin,
Jesu sun, w’omije Re;
Eje Re pelu nke pe;
Ese ti e o fi ku?$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30033'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitori ailabawon li ebun ati ipe Olorun. Rom 11:29
Ipe t’o n ‘bukun l’aoke orun,
Ipe t’o ni ‘bukun li emi npe wa,
O fi agbara fun eni ti n sare,
Eni t’o ba gbagbo, fun 0 ni.$verse_split$,
  $verse_split$Fun o ni ara fun O ni.
Gbekele ‘leri Re to daju (ara mi),
Fun o ni, ma, fun o ni,
Eni t’o ba gbogbo, fun o ni.$verse_split$,
  $verse_split$O ti f’eje Re ‘yebiye se ‘laja,
Omo Olorun ti sise igbala,
Gbogbo ise naa ti pari, o pari,
Lati gba ‘bukun na, fun o ni.$verse_split$,
  $verse_split$Y’o gba enl t’o ba gbagbo la d’opin,
Otito li eyi o da wa loju,
Gba ise otito ati ‘yanu yi,
Eni t’o ba gbagbo, fun o ni.$verse_split$,
  $verse_split$Ma siyemeji mo, wa’ do Re loni,
Kuro ninu ese re patapata,
‘Tori anu Re nla, y’o dariji o,
Y’o si s’amona re de orun.$verse_split$,
  $verse_split$Lohun ni ‘le ogo ao korin ‘yin Re,
Li ohun isegun; lae ati lae,
B’ipe na tile pe, sibe titun ni,
Ogo, Aleluya, fun o ni.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30034'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Loni, bi enyin ba gbo ohun Re e mase se aya yin le. Heb. 4:7.
Wa nigbati Kristi npe o,
Wa, ma rin ‘na ese mo,
Wa, tu gbogb’ ohun t’o de O
Wa, bere ‘re ‘je t’orun.$verse_split$,
  $verse_split$EGBE:
O npe o nisiyi,
Gbo b’Olugbala ti npe,
O npe o nisiyi,
Gbo b’Olugbala ti npe.$verse_split$,
  $verse_split$Wa nigbati Kristi mbebe,
Wa, gbo ohun ife Re,
‘WO o ko ohun ife Re,
Wo o si ma sako sa$verse_split$,
  $verse_split$EGBE:
O npe o nisiyi,
Gbo b’Olugbala ti npe,
O npe o nisiyi,
Gbo b’Olugbala ti npe.$verse_split$,
  $verse_split$Wa mase f’akoko d’ola,
Wa, ojo ‘gbala ni ‘yi,
Wa fi ara re fun Kristi,
Wa wo ‘le niwaju Re.$verse_split$,
  $verse_split$EGBE:
O npe o nisiyi,
Gbo b’Olugbala ti npe,
O npe o nisiyi,
Gbo b’Olugbala ti npe.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30035'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$A se bi O ti wi tan, aye si mbe sibe. Lk. 14:22.
Aye si mbe! Ile Od’agutan,
Ewa ogo re npe o pe “Ma bo”,
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$Ojo lo tan, orun si fere wo,
Okunkun de tan, ‘mole nkoja lo,
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$Ile iyawo na kun fun ase;
Wole, wole to oko ‘yawo lo;
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$O nkun! O nkun! Ile ayo na nkun
Yara! Mase pe ko kun ju fun O!
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$Aye si mbe? Ilekun si sile,
Llekun ife, iwo ko pe ju,
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$Wole, wole! Tire ni Ase na.
Wa gb’ebun ‘fe ayeraye lofe!
Wole, Wole, wole nisisiyi.$verse_split$,
  $verse_split$Kiki ayo lo wa nibe, wole!
Awon angeli npe o fun ade,
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$L’ohun rara n’ipe ife na ndun!
Wa ma jafara, Wole, ase na!
Wole, wole, wole nisisiyi.$verse_split$,
  $verse_split$K’ile to su, ilekun na le ti
‘Gbanao k’abamo! O se! O se!
O se, o se, ko s’aye mo; o se!$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30036'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E o si mo otito, otito yio si SO nyin di ominira. Jn. 8:32
Bi Krist’ ti da okan mi nde,
Aye mi ti dabi orun,
Larin ‘banuje at’aro;
Ayo ni lati mo Jesu,$verse_split$,
  $verse_split$EGBE:
Aleluya! Ayo l’o je,
Pe, mo ti ri ‘dariji gba,
Ibikibi ti mo ba wa,
Ko s’ewu, Jesu wa nibe.$verse_split$,
  $verse_split$Mo ti ro pe orun jina,
Sugbpn nigbati Jesu de;
L’orun ti de ‘nu okan mi,
Nibe ni y’o si wa titi.$verse_split$,
  $verse_split$EGBE:
Aleluya! Ayo l’o je,
Pe, mo ti ri ‘dariji gba,
Ibikibi ti mo ba wa,
Ko s’ewu, Jesu wa nibe.$verse_split$,
  $verse_split$Nibo l’a ko le gbe l’aye
L’o r’oke tabi petele,
L’ahere tabi agbala,
Ko s’ewu, Jesu wa nibe.$verse_split$,
  $verse_split$EGBE:
Aleluya! Ayo l’o je,
Pe, mo ti ri ‘dariji gba,
Ibikibi ti mo ba wa,
Ko s’ewu, Jesu wa nibe.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30037'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Enikeni ti o to mi wa, Emi kiyio taa nu, bi o ti wu ko ri. Jn. 6:3
Bi mo ti ri, lai s’awawi,
Sugbon nitori eje Re,
B’o si ti pe mi pe ki nwa;
Olugbala, mo de.$verse_split$,
  $verse_split$Bi mo ti ri, laiduro pe,
Mo fe k’ okan mi mo toto,
S’odo Re to le we mi mo,
Olugbala, mo de.$verse_split$,
  $verse_split$Bi mo ti ri, b’o tile je,
Ija l’ode, ija ninu,
Eru l’ode, eru ninu,
Olugbala, mo de.$verse_split$,
  $verse_split$Bi mo ti ri, osi are;
Mo si nwa imularada,
Iwo le s’awotan mi,
Olugbala, mo de.$verse_split$,
  $verse_split$Bi mo ti ri ‘wo o gba mi,
‘Wo o gba mi, t’owo t’ese;
‘Tori mo gba ‘leri Re gbo;
Olugbala, mo de.$verse_split$,
  $verse_split$Bi mo ti ri ife Tire,
L’o sete mi patapata,
Mo di Tire, Tire nikan;
Olugbala, mo de.$verse_split$,
  $verse_split$Bi mo ti ri, n’nu fe nla ni,
T’o fi titobi Re han mi;
Nihin yi ati ni oke;
Olugbala, mo de.$verse_split$,
  $verse_split$Amin$verse_split$
]::text[]
WHERE hymn_number = '30038'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nigbati o ba wo o, Yio ye. Num. 21:8.
Oluwa ran mi ni ‘se, Aleluya!
Iwo ni uno je ise na fun;
A ko s’inu Oro Re, Aleluya!
P’eni t’o ba wo Jesu y’o ye.$verse_split$,
  $verse_split$EGBE:
Wo, k’o ye, Arakunrin,
Wo Jesu ki o si ye,
A ko s’inu Oro Re, Aleluya!
P’eni t’o ba wo Jesu y’o ye.$verse_split$,
  $verse_split$A ran mi n’ise ayo, Aleluya!
Uno j’isena fun o ore mi;
Ise lat’ oke wa ni; Aleluya!
Jesu SO, mo mo pe oto ni.$verse_split$,
  $verse_split$EGBE:
Wo, k’o ye, Arakunrin,
Wo Jesu ki o si ye,
A ko s’inu Oro Re, Aleluya!
P’eni t’o ba wo Jesu y’o ye.$verse_split$,
  $verse_split$A n’owo iye si O, Aleluya!
A o fi ‘ye ailopin fun O;
T’o ba wo Jesu nikan, Aleluya!
Wo o, On nikan l’o le gbala.$verse_split$,
  $verse_split$EGBE:
Wo, k’o ye, Arakunrin,
Wo Jesu ki o si ye,
A ko s’inu Oro Re, Aleluya!
P’eni t’o ba wo Jesu y’o ye.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30039'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Gbo adura mi Oluwa, ki o sije ki igbe mi ki o wa sodo Re. OD. 102:1
Olugbala, gb’ohun mi,
Gb’ohun mi, gb’ohun mi,
Mo wa s’odo Re, gba mi,
Nibi agbelebu di,
Emi se sugbon Oku;
Iwo ku, Iwo ku,
Fi anu Re pa mi mo,
Nibi agbelebu.$verse_split$,
  $verse_split$EGBE:
Oluwa, jo gba mi,
Nki y’o bi O ninu mo!
Alabukun, gba mi,
Nibi agbelebu.$verse_split$,
  $verse_split$Ese mi po lapoju,
Uno bebe, un o bebe!
Iwo li Ona iye,
Nibi agbelebu,
Ore-ofe Re t’a gba,
L’ofeni! L’ofeni;
F’oju anu Re wo mi,
N’ibi agbelebu.$verse_split$,
  $verse_split$EGBE:
Oluwa, jo gba mi,
Nki y’o bi O ninu mo!
Alabukun, gba mi,
Nibi agbelebu.$verse_split$,
  $verse_split$F’eje mimo Re we mi,
Fi we mi! Fi we mi!
Ri mi sinu ibu Re,
N’ibi agbelebu,
‘Gbagbo l’o le fun wa ni,
Dariji Dariji,
Mo f’igbagbo ro mo O,
N’ibi agbelebu.$verse_split$,
  $verse_split$EGBE:
Oluwa, jo gba mi,
Nki y’o bi O ninu mo!
Alabukun, gba mi,
Nibi agbelebu.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30040'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Fa mi, awa yo sare to O. O.Sol. 1:4.
Oluwa, emi sa ti gb’ ohun Re,
O nso ife Re simi,
Sugbon mo fe nde l’ apa igbagbo,
Ki nle tubo sun mo O.$verse_split$,
  $verse_split$EGBE:
Fa mi mora, mora, Oluwa,
Sib’ agbelebu t’O ku,
Fa mi mora, mora, mora Oluwa,
Sib’ eje Re t’on’iye.$verse_split$,
  $verse_split$Ya mi si mimo fun ise Tire,
Nipa ore-ofe Re,
Je ki nfi okan igbagbo w’ oke,
K’ ife mi’si je Tire.$verse_split$,
  $verse_split$EGBE:
Fa mi mora, mora, Oluwa,
Sib’ agbelebu t’O ku,
Fa mi mora, mora, mora Oluwa,
Sib’ eje Re t’on’iye.$verse_split$,
  $verse_split$A! Ayo mimo ti wakati kan,
Ti mo lo nib’ ite Re;
‘Gba mo ngb’ adura si O, Olorun,
Ti a soro bi ore.$verse_split$,
  $verse_split$EGBE:
Fa mi mora, mora, Oluwa,
Sib’ agbelebu t’O ku,
Fa mi mora, mora, mora Oluwa,
Sib’ eje Re t’on’iye.$verse_split$,
  $verse_split$Ijinle ife mbe ti nko le mo,
‘Titi un o koja odo,
Ayo giga ti emi ko le so,
Titi uno fi de ‘simi.$verse_split$,
  $verse_split$EGBE:
Fa mi mora, mora, Oluwa,
Sib’ agbelebu t’O ku,
Fa mi mora, mora, mora Oluwa,
Sib’ eje Re t’on’iye.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30041'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Bi iwo ba rewesi li ojo iponju, agbara re ko to nkan. Owe 24:10.
Mo gbo Jesu wipe,
Agbara re kere,
Alare, sora, gbadua,
Pipe re mbe lodo mi.$verse_split$,
  $verse_split$EGBE:
Jesu san gbogbo,
‘Gbese ti mo je,
Ese to m’abawon wa,
Lo ti fo nu kuro.$verse_split$,
  $verse_split$Oluwa, toto mo mo,
P’agbara Re nikan;
Le s’adete di mimo,
O le m’okan lile ro.$verse_split$,
  $verse_split$EGBE:
Jesu san gbogbo,
‘Gbese ti mo je,
Ese to m’abawon wa,
Lo ti fo nu kuro.$verse_split$,
  $verse_split$Ko si ‘re ‘kan ti mo ni,
Lati ni ore Re,
Em’o fo aso mi mo,
N’n’ eje Jesu Oluwa.$verse_split$,
  $verse_split$EGBE:
Jesu san gbogbo,
‘Gbese ti mo je,
Ese to m’abawon wa,
Lo ti fo nu kuro.$verse_split$,
  $verse_split$Gbati ‘pe ‘keyin ba dun,
T’o n pe mi s’odo Re,
Jesu ti san gbogbo re,
E m’o ba g’oke orun.$verse_split$,
  $verse_split$EGBE:
Jesu san gbogbo,
‘Gbese ti mo je,
Ese to m’abawon wa,
Lo ti fo nu kuro.$verse_split$,
  $verse_split$N’iwaju ‘te uno duro,
N’nu pipe ewa Kristi,
Un o fi ade ogo ni;
Lele li ese Jesu.$verse_split$,
  $verse_split$EGBE:
Jesu san gbogbo,
‘Gbese ti mo je,
Ese to m’abawon wa,
Lo ti fo nu kuro.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30042'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Isun kan yio si sile fun ese ati iwa aimo. Sek. 13:1.
Isun kan wu to kun f’eje,
T’o ti ‘ha Jesu yo,
Elese mokun ninu re,
O bo ninu ebi.$verse_split$,
  $verse_split$‘Gba mo f’igbagbo r’isun na,
Ti nsan fun eje Re,
Irapada d’orin fun mi,
Ti uno ma ko titi.$verse_split$,
  $verse_split$Orin t’o dun ju eyi lo,
Li emi o ma ko;
‘Gbati ore-ofe Re ba,
Mu mi de odo Re.$verse_split$,
  $verse_split$Mo gbagbo p’O pese fun mi,
Bi mo tile s’aiye,
Ebun ofe t’a feje ra,
Ati duru wura.$verse_split$,
  $verse_split$Duru t’a t’ow’ Olorun se,
Ti ko ni baje lae,
Ti ao ma fi yin Baba wa,
Oruko Re nikan.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30043'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E wa sodo mi, gbogbo enyin ti n sise, ti a si di eru wiwo le lori, Emi o si fi isimi fun nyin. – Matt. 11:28
B’eru ese re ba nwo o lorun,
Pe Jesu wole okan re;
B’o nd’aniyan isoji okan re,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$EGBE:
Le ‘yemeji re sonu,
Ba Oluwa re laja;
Si okan re paya fun,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$Bi o ba nwa iwenumo kiri,
Pe Jesu wole okan re;
Omi ‘wenumo ko jina si o,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$EGBE:
Le ‘yemeji re sonu,
Ba Oluwa re laja;
Si okan re paya fun,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$B’igbi wahala ba ngba o kiri,
Pe Jesu wole okan re;
B’afo ba wa ti aye ko le di,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$EGBE:
Le ‘yemeji re sonu,
Ba Oluwa re laja;
Si okan re paya fun,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$Bi ore t’o gbekele ba da o;
Pe Jesu wole okan re;
On nikan ni Olubanidaro,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$EGBE:
Le ‘yemeji re sonu,
Ba Oluwa re laja;
Si okan re paya fun,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$B’o nfe korin awon olubukun;
Pe Jesu wole okan re,
Bi o nfe wo agbala isimi,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$EGBE:
Le ‘yemeji re sonu,
Ba Oluwa re laja;
Si okan re paya fun,
Pe Jesu wole okan re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30044'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$A wa ti fi gbogbo re sile, awa si nto O lehin. Mat. 19:27
Gbogb’ ohun t’o nfa mi, mo fi ‘le,
Nihin ni Kenan’ mo ri ayo;
Alafia, ‘bukun ‘yebiye,
‘Tori mo ngbe Kenani n’siyi.$verse_split$,
  $verse_split$EGBE:
Mo ngbe Kenani nisisiyi.
Nib’ owara ibukun gbe wa,
Nibi a ni opo oro oor’-ofe,
Mo n gbe Kenaan’ nisisiyi.$verse_split$,
  $verse_split$Mo ngbe lail’ewu nko je beru,
Olugbala mi wa nitosi,
‘Gba mo ba pe, y’o gbadura mi,
‘Tori mo ngbe Kenani n’siyi.$verse_split$,
  $verse_split$EGBE:
Mo ngbe Kenani nisisiyi.
Nib’ owara ibukun gbe wa,
Nibi a ni opo oro oor’-ofe,
Mo n gbe Kenaan’ nisisiyi.$verse_split$,
  $verse_split$Mo mu omi kanga alaigbe,
Ni Kenan ibugbe ife mi!
Emi o so fun elomiran,
Pe emi ngbe n’ile Kenani.$verse_split$,
  $verse_split$EGBE:
Mo ngbe Kenani nisisiyi.
Nib’ owara ibukun gbe wa,
Nibi a ni opo oro oor’-ofe,
Mo n gbe Kenaan’ nisisiyi.$verse_split$,
  $verse_split$Iyin ailopin ni mo mu wa,
Fun Jesu, Oba Irapapda;
Em’ o korin opo anu Re,
‘Tori mo ngbe Kenani n’ siyi.$verse_split$,
  $verse_split$EGBE:
Mo ngbe Kenani nisisiyi.
Nib’ owara ibukun gbe wa,
Nibi a ni opo oro oor’-ofe,
Mo n gbe Kenaan’ nisisiyi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30045'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitori oruko Re, dari ese miji. OD. 25:11
Ki ‘sel’aini ‘reti,
Ni mo to ‘wa,
Ki’se laini’gbagbo,
Ni mo kunle,
Ese ti g’ ori mi,
Eyi sa l’ebe mi,
Eyi sa l’ebe mi,
Jesu ti ku.$verse_split$,
  $verse_split$A! Ese ni ipo ju,
O pon koka,
Ada le, ada le,
Ni mond’ese;
Ese aiferan Re,
Ese aigba O gbo,
Ese aigbo O gbo,
Ese nlanla.$verse_split$,
  $verse_split$Oluwa, mo jewo,
Ese nla mi,
‘O mo bi mo ti ri,
Bi mo ti wa;
Jo, we ese mi nu,
K’okan mi mo loni,
K’okan mi mo loni,
Ki ndi mimo.$verse_split$,
  $verse_split$Olododo ni O,
O ndariji,
L’ese agbelebu,
Ni mo wole;
Jek’eje iwenu;
Eje od’agutan,
Eje od’agutan,
We okan mi.$verse_split$,
  $verse_split$‘Gbana alafia,
Y’o d’okan jni,
‘Gbana uno ba O rin,
Ore airi;
Ore airi;
Em’ o f’ara ti O;
Jo ma to mi s’ona,
Jo ma to mi s’ona,
Titi aye.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30046'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ore-ofe, l’ ohun,
Adun ni l’eti wa;
Gbohun-gbohun re y’o gba orun kan,
Aye y’o gbo pelu.$verse_split$,
  $verse_split$EGBE:
Ore-Ofe sa,
N’igbekele mi,
Jesu ku fun araye,
O ku fun mi pelu.$verse_split$,
  $verse_split$Ore-ofe l’o ko,
Oruko mi l’orun,
L’o fi mi fun Od’agutan,
T’O gba iya mi je.$verse_split$,
  $verse_split$EGBE:
Ore-Ofe sa,
N’igbekele mi,
Jesu ku fun araye,
O ku fun mi pelu.$verse_split$,
  $verse_split$Ore-Ofe to mi,
S’ona alafia,
O ntoju mi l’ojojumo,
Ni irin ajo mi.$verse_split$,
  $verse_split$EGBE:
Ore-Ofe sa,
N’igbekele mi,
Jesu ku fun araye,
O ku fun mi pelu.$verse_split$,
  $verse_split$Ore-ofe ko mi,
Bi a ti ‘gbadura;
O pa mi mo titi d’oni,
Kosi je ki nsako.$verse_split$,
  $verse_split$EGBE:
Ore-Ofe sa,
N’igbekele mi,
Jesu ku fun araye,
O ku fun mi pelu.$verse_split$,
  $verse_split$Je k’ ore-ofe yi,
F’agbara fokan mi;
Ki nle fi gbogbo ipa mi,
At’ ojo mi fun O.$verse_split$,
  $verse_split$EGBE:
Ore-Ofe sa,
N’igbekele mi,
Jesu ku fun araye,
O ku fun mi pelu.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30047'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Anu se e. – Lk. 10:33.
Ife l’o fi wa emi;
Ti eru ese npa,
O gbe mi s’ejika Re,
Pada bowa s’agbo;
Angeli nfi ayo korin;
Pelu awon ogun orun.$verse_split$,
  $verse_split$EGBE:
A! Ife t’o wa mi,
A! Eje t’o ra mi,
Suru pelu ore-ofe Re;
T’o fa mi pada bo wa s’agbo!$verse_split$,
  $verse_split$Mo gbogbe, mo fere ku,
O tu ororo si;
O so fun mi jeje pe:
“Temi ni iwo se!”
Nko gb’ohun t’o dun to ‘yi ri,
O mu okan are mi yo.$verse_split$,
  $verse_split$O f’apa iso han mi,
N’tori mi l’O jiya;
A de li ade egun;
Lati fi se esin;
Nko m’ohun t’O ri l’ara mi,
T’o fi jiya po be fun mi.$verse_split$,
  $verse_split$Mo joko niwaju Re,
N’nu ‘mole oju Re;
Mo si nfi iyanu nla,
Ranti ibukun Re;
Ayeraye fere ma to,
Lati fi korin iyin Re.$verse_split$,
  $verse_split$B’akoko ti nkoja lo,
N’isimi pipe de;
Mo nreti owuro ni;
Ti o dara julo,
‘Gba’ On y’o pe wa sodo Re,
B’iyawo Re, lailabawon.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30049'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ojo nla l’ojo ti mo yan,
Olugbala l’Olorun mi;
O ye ki okan mi ma yo,
K’o si ro ihin na kale.$verse_split$,
  $verse_split$EGBE:
Ojo nla l’ojo na;
Ti Jesu we ese mi nu;
O ko mi ki nma gbadura,
Ki nma sora, ki nsi ma yo,
Ojo nla l’ojo na;
Ti Jesu we ese mi nu.$verse_split$,
  $verse_split$Ise igbala pari na,
Mo di t’Oluwa mi loni;
On l’o pe mi, ti mo si je,
Mo f’ayo j’ipe mimo na.$verse_split$,
  $verse_split$EGBE:
Ojo nla l’ojo na;
Ti Jesu we ese mi nu;
O ko mi ki nma gbadura,
Ki nma sora, ki nsi ma yo,
Ojo nla l’ojo na;
Ti Jesu we ese mi nu.$verse_split$,
  $verse_split$Eje mimo yi ni mo je;
F’eni to ye lati feran:
Je k’orin didun kun ‘le RE,
Nigba mo ba nlo sin nibe.$verse_split$,
  $verse_split$EGBE:
Ojo nla l’ojo na;
Ti Jesu we ese mi nu;
O ko mi ki nma gbadura,
Ki nma sora, ki nsi ma yo,
Ojo nla l’ojo na;
Ti Jesu we ese mi nu.$verse_split$,
  $verse_split$Simi, aiduro okan mi,
Simi le Jesu Oluwa;
Tani je wipe aye dun,
Ju odo awon angeli?$verse_split$,
  $verse_split$EGBE:
Ojo nla l’ojo na;
Ti Jesu we ese mi nu;
O ko mi ki nma gbadura,
Ki nma sora, ki nsi ma yo,
Ojo nla l’ojo na;
Ti Jesu we ese mi nu.$verse_split$,
  $verse_split$‘Wo orun t o ngbo eje mi,
Y’o ma tun gbo lojojumo,
Tit’ ojo t’emi mi y’o pin;
Ni uno ma m’eje mi na se.$verse_split$,
  $verse_split$EGBE:
Ojo nla l’ojo na;
Ti Jesu we ese mi nu;
O ko mi ki nma gbadura,
Ki nma sora, ki nsi ma yo,
Ojo nla l’ojo na;
Ti Jesu we ese mi nu.$verse_split$
]::text[]
WHERE hymn_number = '30050'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Emi o ma too lehin nibikibi ti iwo nlo. – Matt. 8:19.
‘Bikibi ti Jesu wa, ewu ko si,
‘Bikibi t’O to mi si n’nu aye yi;
Laisi Re, ayo kan ko le dun mo mi,
‘Bikibi ti Jesu wa, eru ko si.$verse_split$,
  $verse_split$EGBE:
‘Bikibi pelu Re, kil’a o beru,
‘Bikibi ti Jesu wa, ewu ko si.$verse_split$,
  $verse_split$‘Bikibi pelu Jesu ayo lo je,
B’ore miran ko mi, On ko je ko mi;
Bo tile mu mi koju isan ‘danwo,
‘Bikibi pelu Jesu ayo lo je.$verse_split$,
  $verse_split$EGBE:
‘Bikibi pelu Re, kil’a o beru,
‘Bikibi ti Jesu wa, ewu ko si.$verse_split$,
  $verse_split$‘Bikibi pelu Jesu ni mo le sun,
B’o tile je pe okunkun yi mi ka,
Mo mo pe uno ji si iye pelu Re;
‘Bikibi ti Jesu wa, ile lo je.$verse_split$,
  $verse_split$EGBE:
‘Bikibi pelu Re, kil’a o beru,
‘Bikibi ti Jesu wa, ewu ko si.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30051'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Se alabapin pelu mi ninu iponju bi omo-ogun rere Jesu Kristi. – II Tim. 2:3.
E dide, omo igbala,
Eyin t’e fe Oluwa,
Dide, ilu alagbara;
Ki ota to de Sion.$verse_split$,
  $verse_split$EGBE:
F’agbara re korin kikan,
Bi iro omi okun,
Nipa eje Kristi Jesu,
Awa ju asegun lo;
Awa ju asegun lo,
Awa ju asegun lo,
Nipa eje Kristi Jesu,
Awa ju asegun lo.$verse_split$,
  $verse_split$Egbe mimo ti igbani,
Ti won ti nrin ona yi;
W’asia won t’o nfe lele,
Asegun nipa Kristi.$verse_split$,
  $verse_split$EGBE:
F’agbara re korin kikan,
Bi iro omi okun,
Nipa eje Kristi Jesu,
Awa ju asegun lo;
Awa ju asegun lo,
Awa ju asegun lo,
Nipa eje Kristi Jesu,
Awa ju asegun lo.$verse_split$,
  $verse_split$A ti gbe ‘ku mi ni ‘segun,
Lye wa mbe n’nu Kristi;
L’ojo ‘farahan Oluwa;
A o ho iho ayo.$verse_split$,
  $verse_split$EGBE:
F’agbara re korin kikan,
Bi iro omi okun,
Nipa eje Kristi Jesu,
Awa ju asegun lo;
Awa ju asegun lo,
Awa ju asegun lo,
Nipa eje Kristi Jesu,
Awa ju asegun lo.$verse_split$,
  $verse_split$Laipe ao de ‘bi ite Re;
Ao si mo Oba Ogo;
Nibe ao ke, “Kabiyesi”,
Gbogbo wa y’o gba ere.$verse_split$,
  $verse_split$EGBE:
F’agbara re korin kikan,
Bi iro omi okun,
Nipa eje Kristi Jesu,
Awa ju asegun lo;
Awa ju asegun lo,
Awa ju asegun lo,
Nipa eje Kristi Jesu,
Awa ju asegun lo.$verse_split$
]::text[]
WHERE hymn_number = '30052'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$So fun awon omo Israeli ki won ki o tesiwaju. – Eks. 14:15.
E ma te siwaju, Kristian ologun,
Ma tejumo Jesu t’O mbe niwaju,
Kristi Oluwa wa ni Balogun wa,
Wo! Asia Re wa niwaju ogun.$verse_split$,
  $verse_split$EGBE:
E ma te siwaju, Kristian ologun;
Sa tejumo Jesu t’O mbe niwaju.$verse_split$,
  $verse_split$Ni oruko Jesu, ogun esu sa,
Nje Kristian ologun ma nso si isegun;
Orun apadi mi ni hiho iyin,
Ara, gb’ohun yin ga, gb’orin yin soke.$verse_split$,
  $verse_split$EGBE:
E ma te siwaju, Kristian ologun;
Sa tejumo Jesu t’O mbe niwaju.$verse_split$,
  $verse_split$Bi egbe ogun nla n’Ijo Olorun,
A ra, an rin l’ona t’awon mimo nrin;
A ko ya wa ni ‘pa, egbe kan ni wa;
Okan ni ‘reti, ni eko ni ife.$verse_split$,
  $verse_split$EGBE:
E ma te siwaju, Kristian ologun;
Sa tejumo Jesu t’O mbe niwaju.$verse_split$,
  $verse_split$Ite ati ‘joba wonyi le parun,
Sugbon Ijo Jesu y’o wa titi lae,
Orun – apadi ko le bor’ ijo yi,
A n’ileri Kristi, eyi ko le ye.$verse_split$,
  $verse_split$EGBE:
E ma te siwaju, Kristian ologun;
Sa tejumo Jesu t’O mbe niwaju.$verse_split$,
  $verse_split$E ma ba mi kalo, eyin eniyan,
D’ohun yin po mo wa, l’orin isegun;
Ogo, iyin, Ola fun Kristi Oba!
Eyi ni y’o ma je orin wa titi.$verse_split$,
  $verse_split$EGBE:
E ma te siwaju, Kristian ologun;
Sa tejumo Jesu t’O mbe niwaju.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30053'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Sugbon eyi ti enyin ni, e di i mu sinsin titi Emi o fi de. – Ifi. 2:25.
Ha! Egbe mi e w’asia;
Bi ti nfe lele!
Ogun Jesu fere de na,
A fere segun.$verse_split$,
  $verse_split$EGBE:
D’odi mu, Emi fere de;
Beni Jesu nwi,
Ran ‘dahun pada s’orun, pe;
“Awa o di mu.”$verse_split$,
  $verse_split$Wo opo ogun ti mbo wa;
Esu nko won bo;
Awon alagbara nsubu,
A fe damu tan!$verse_split$,
  $verse_split$EGBE:
D’odi mu, Emi fere de;
Beni Jesu nwi,
Ran ‘dahun pada s’orun, pe;
“Awa o di mu.”$verse_split$,
  $verse_split$Wo asia Jesu ti nfe,
Gbo ohun ipe;
A o segun gbogbo ota;
Ni oruko Re.$verse_split$,
  $verse_split$EGBE:
D’odi mu, Emi fere de;
Beni Jesu nwi,
Ran ‘dahun pada s’orun, pe;
“Awa o di mu.”$verse_split$,
  $verse_split$Ogun ngbona girigiri,
Iranwo wa mbo;
Balogun wa mbo wa tete,
Egbe, tujuka!$verse_split$,
  $verse_split$EGBE:
D’odi mu, Emi fere de;
Beni Jesu nwi,
Ran ‘dahun pada s’orun, pe;
“Awa o di mu.”$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30054'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitorina, e gbe gbogbo ihamora Olorun WO. – Efe. 6:13.
Duro, duro fun Jesu,
Eyin Om’ogun Krist’;
Gbe asia Re s’oke,
A ko gbodo fe ku;
Lat’ isegun de ‘segun,
Ni y’o to ogun Re;
Tit’ ao segun gbogb’ ota,
Ti Krist’ y’O j’Oluwa.$verse_split$,
  $verse_split$Duro, duro fun Jesu,
F’eti s’ohun ipe;
Jade lo s’oju ija;
Loni ojo nla Re;
Eyin akin ti nja fun,
Larin ainiye ota,
N’nu ewu e ni ‘gboya,
E ko ‘ju ‘ja s’ota.$verse_split$,
  $verse_split$Duro, duro fun Jesu,
Duro l’agbara Re;
Ipa eniyan ko to,
Ma gbekele tire,
Di ‘hamora ‘hinrere,
Ma s’ona, ma gbadua,
B’ise tab’ ewu ba pe,
Ma se alai de ‘be.$verse_split$,
  $verse_split$Duro, duro fun Jesu,
Ija na ki y’o pe;
Oni, ariwo ogun,
Ola, orin ‘segun!
Eni t’o ba si segun!
Y’o gba ade iye,
Y’o ma ba Oba ogo;
J’oba titi laelae.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30055'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E ma sona, ki e si ma gbadura, ki eyin ki o ma ba bo sinu idewo. – Mat. 26:41.
Kristian mase jafara;
Gbo b’angeli re ti nwi:
Ni arin ota lo wa,
Ma sora.$verse_split$,
  $verse_split$Ogun orun apadi,
T’a ko ri nko ‘ra won jo;
Won nso ijafara re,
Ma sora.$verse_split$,
  $verse_split$Wo ‘hamora orun re,
Wo l’osan ati l’oru;
Esu ba, o nd’ode re;
Ma sora.$verse_split$,
  $verse_split$Awon to segun saju,
Won nwo wa b’awa ti nja;
Won nfi ohun kan wipe:
Ma sora.$verse_split$,
  $verse_split$Gbo b’Oluwa re ti wi,
Eni ti iwo feran;
F’oro Re si okan re;
Ma sora.$verse_split$,
  $verse_split$Ma sora bi enipe;
Nibe ni ‘segun re wa,
Gbadura fun ‘ranlowo,
Ma sora.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30056'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Awa ju eniti o segun lo, nipa eniti o fe wa. – Rom. 8:37.
Asegun ati ajogun ni a je,
Nipa eje Kristi a ni isegun;
B’Oluwa je tiwa, a ki yo subu;
Ko s’ohun to le bori agbara Re.$verse_split$,
  $verse_split$EGBE:
Asegun ni wa, nipa eje Jesu;
Baba fun wa ni ‘segun, nipa eje Jesu;
Eni t’apa f’elese,
Sibe, O wa, O njoba;
Awa ju asegun lo,
Awa ju asegun lo.$verse_split$,
  $verse_split$A nlo l’oruko Olorun Israel,
Lati segun ese at’aisododo;
Kise fun wa, sugbon tire ni iyin,
Fun ‘gbala at’isegun ta f’eje ra.$verse_split$,
  $verse_split$EGBE:
Asegun ni wa, nipa eje Jesu;
Baba fun wa ni ‘segun, nipa eje Jesu;
Eni t’apa f’elese,
Sibe, O wa, O njoba;
Awa ju asegun lo,
Awa ju asegun lo.$verse_split$,
  $verse_split$Eni t’O ba si segun li ao fi fun,
Lati je manna to t’orun wa nihin;
L’orun yo si gbe imo ‘pe asegun,
Yo wo ‘so funfun, yo si dade wura.$verse_split$,
  $verse_split$EGBE:
Asegun ni wa, nipa eje Jesu;
Baba fun wa ni ‘segun, nipa eje Jesu;
Eni t’apa f’elese,
Sibe, O wa, O njoba;
Awa ju asegun lo,
Awa ju asegun lo.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30057'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$So fun awon omo Israeli ki won ki o tesiwaju. – Eks. 14:15.
Kristi Balogun wa niwaju ogun,
B’O ba ran wa n’ise a ko ni beru;
Bi ohun t’O fe se ko tile ye wa,
Sibe ao tele titi.$verse_split$,
  $verse_split$EGBE:
Tesiwaju! L’ase Oluwa,
Te siwaju si ‘le ‘leri na;
Te siwaju ko orin soke,
Pelu Kristi, isegun daju.$verse_split$,
  $verse_split$Gbogbo ifeju esu ko le mi wa,
Bi Kristi je asa at’apata wa;
Ao ma fi ida emi bi a ti nlo,
A o ma tele titi.$verse_split$,
  $verse_split$EGBE:
Tesiwaju! L’ase Oluwa,
Te siwaju si ‘le ‘leri na;
Te siwaju ko orin soke,
Pelu Kristi, isegun daju.$verse_split$,
  $verse_split$E je ki a gbe asia wa s’oke,
Ibi ko le de ibiti o ba wa,
Kristi, Balogun wa ti segun aye,
A o ma tele titi.$verse_split$,
  $verse_split$EGBE:
Tesiwaju! L’ase Oluwa,
Te siwaju si ‘le ‘leri na;
Te siwaju ko orin soke,
Pelu Kristi, isegun daju.$verse_split$,
  $verse_split$B’ogun na tile le ko ni pe pari;
Nigbana, ao dapo pe l’awon mimo;
Lati fi ayo ko orin isegun,
Bi aba tele titi.$verse_split$,
  $verse_split$EGBE:
Tesiwaju! L’ase Oluwa,
Te siwaju si ‘le ‘leri na;
Te siwaju ko orin soke,
Pelu Kristi, isegun daju.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30058'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Kiyesi i, O mbo ninu awosanma. Ifi. 1:7.
Jesu mbo l’ofurufu pel’ayo,
Ojo ayo! Ojo ayo!
Awon t’o fe yo fo lo pade Re,
Ojo ayo! Ayo nla.
Won yo pade Oluwa ni sanma,
Gbogbo wa pelu Jesu yo wa nibe,
Ao bo lowo aniyan at’aro;
Ojo ayo! Ayo nla!$verse_split$,
  $verse_split$Awon obi, omo yo tun pade;
Ojo ayo! Ojo ayo!
Arakunrin pelu arabirin,
Ojo ayo! Ojo nla
Won mbe l’odo Krist’ a ko ri won mo,
Ibanuje ni lilo won je fun wa;
Sugbon ao pade laipe pel’ayo,
Ojo ayo! Ayo nla!$verse_split$,
  $verse_split$Gbogbo wa ha setan fun bibo Re?
Ojo ayo! Ojo ayo!
Omode ati agba ha se tan!
Fojo nla! Ojp ayo!
A nfe lati wa l’odo Re laelae
K’a le ma wo oju ati ewa Re,
Eyin ara, e korin nitori
Ojo nla na t’ao pade.$verse_split$,
  $verse_split$Awon miran ko ni le ba wa ko
Orin ayo ti ojo na!
Sugbon gbogbo wa ni ayo mbe fun
Ojo ayo! Ojo nla;
‘Tori Jesu nduro sibesibe,
K’a le mura tan nipa agbara Re,
Ninu ogo didan Re k’a le ni
Ibugbel’oke orun.$verse_split$,
  $verse_split$Amin$verse_split$
]::text[]
WHERE hymn_number = '30060'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Filippi o si wasu Jesu fun u. – Ise A. 8:35.
Jesu nikan li a nwasu;
Jesu nikan l’a nrohin,
Awa y’o gbe Jesu soke,
On nikan l’awa nfe ri.$verse_split$,
  $verse_split$EGBE:
Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.$verse_split$,
  $verse_split$Jesu ni Olugbala wa;
O ru gbogbo ebi wa,
Ododo Re lo gbe wo wa,
O ns’agbara wa d’otun.$verse_split$,
  $verse_split$EGBE:
Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.$verse_split$,
  $verse_split$Jesu l’o nso wa di mimo;
T’o nwe abawon wa nu,
O nsegun ese at’ ara;
Nipa iranwo Emi.$verse_split$,
  $verse_split$EGBE:
Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.$verse_split$,
  $verse_split$Jesu ni Oluwosan wa;
O ti ru ailera wa,
Nip’ agbara ajinde Re,
A ni ilera pipe.$verse_split$,
  $verse_split$EGBE:
Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.$verse_split$,
  $verse_split$Jesu nikan l’agbara wa;
Agbara Pentokosti,
Jo, da agbara yi lu wa;
F’Emi Mimo Re kun wa.$verse_split$,
  $verse_split$EGBE:
Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.$verse_split$,
  $verse_split$Jesu ni awa nduro de;
A nreti ohun ipe,
‘Gbat’O ba de, Jesu nikan;
Y’o je Orin wa titi.$verse_split$,
  $verse_split$EGBE:
Jesu nikan, Jesu nikan,
Jesu nikan l’orin wa,
Olugbala, Oluwosan;
Oba ti mbo lekeji.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30061'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitori ipeyo dun, a o siji awon oku dide. – I Kor. 15:52.
Gbati ipe Oluwa ba dun,
T’aye y’o si fo lo,
Ti imole Ojo titun y’o si de;
Nigbati awon omo igbala ba pejo l’oke,
T’a ba si p’oruko nibe, uno wa m’be.$verse_split$,
  $verse_split$EGBE:
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
Nipa ore-ofe nikan, un o wa n’be.$verse_split$,
  $verse_split$L’oro ojo na t’awon oku n’nu Kristi y’o jinde,
Ti won y’o si pin n’nu ogo ajinde;
‘Gbati awon ayanfe y’o peji si ode orun,
T’a ba si p’oruko l’ohun, uno wa n’be.$verse_split$,
  $verse_split$EGBE:
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
Nipa ore-ofe nikan, un o wa n’be.$verse_split$,
  $verse_split$Jeki a fi gbogbo akoko wa sise f’Oluwa;
Jeki a royin ife iyanu Re;
Nigbati a ba si pari ire ije wa l’aye,
T’a’ba si p’oruko l’ohun, uno wa n’be.$verse_split$,
  $verse_split$EGBE:
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
‘Gbat’ a ba p’oruko l’ohun,
Nipa ore-ofe nikan, un o wa n’be.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30062'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Kiyesii, emi mbo kankan; ere mi si mbe pelu mi. Ifi. 22:12.
Gba Jesu de lati fere fun wa,
Yala osan tab’ ale,
Y’o ha ba wa, ka ma f’oto sona,
K’atupa wa si ma jo?$verse_split$,
  $verse_split$EGBE:
A ha le wipe, a se tan, ara,
Fun ‘le wa didan l’oke?
Wi, y’O ha ba ‘wo at’emi nsona?
Nsona, nsona n’gb’Oluwa o de?$verse_split$,
  $verse_split$Nje bo ba je oro kutukutu,
T’O ba pe wa ni kokan,
‘Gbat’ a ba da Talenti wa pada,
Y’O ha wi fun o, “o seun?$verse_split$,
  $verse_split$EGBE:
A ha le wipe, a se tan, ara,
Fun ‘le wa didan l’oke?
Wi, y’O ha ba ‘wo at’emi nsona?
Nsona, nsona n’gb’Oluwa o de?$verse_split$,
  $verse_split$A ha soto s’eyi t’O fi fun wa?
Gbogbo ipa wa la nsa?
Ti ko ba si ‘dalebi l’okan wa,
‘Simi ologo lao ni.$verse_split$,
  $verse_split$EGBE:
A ha le wipe, a se tan, ara,
Fun ‘le wa didan l’oke?
Wi, y’O ha ba ‘wo at’emi nsona?
Nsona, nsona n’gb’Oluwa o de?$verse_split$,
  $verse_split$‘Bukun l’awon ti Krist’ ri to nsona,
Won o pin nin’ ogo Re;
Bi l’aro tabi oganjo oru,
Y’O ha ba wa be nsona?$verse_split$,
  $verse_split$EGBE:
A ha le wipe, a se tan, ara,
Fun ‘le wa didan l’oke?
Wi, y’O ha ba ‘wo at’emi nsona?
Nsona, nsona n’gb’Oluwa o de?$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30063'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nwon o si je temi, li Oluwa awon-omo ogun wi, li ojo na nigbati mo ba nsiro oso mi. – Mal. 3:17.
‘Gbat’ O ba de ‘gba t’O ba de,
Lati sir’ oso Re;
Gbogb’ oso Re iyebiye,
Awon ti O fe.$verse_split$,
  $verse_split$EGBE:
Bi irawo owuro, won ns’ade Re loso,
Ewa won o yo pupo, ewa f’ade Re.$verse_split$,
  $verse_split$Yi o ko jo, yi o ko jo,
Oso ijoba Re;
Awon mimo, awon didan,
Awon ti O fe.$verse_split$,
  $verse_split$EGBE:
Bi irawo owuro, won ns’ade Re loso,
Ewa won o yo pupo, ewa f’ade Re.$verse_split$,
  $verse_split$Awon ewe, awon ewe,
T’o fe Olugbala;
Ni oso Re iyebiye,
Awon ti O fe.$verse_split$,
  $verse_split$EGBE:
Bi irawo owuro, won ns’ade Re loso,
Ewa won o yo pupo, ewa f’ade Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30064'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Iwo so mi di aye gege bi oro Re. – OD. 119:25.
Fun mi n’iwa mimo; igbona okan,
Suru ninu iya; aro fun ese;
Igbagbo n’nu Jesu! Ki nmo ‘toju Re,
Ayo n’nu isin Re, emi adura.$verse_split$,
  $verse_split$Fun mi l’okan ope, igbekele Krist’;
Itara f’ogo Re; ‘reti n’n’ oro Re,
Ekun fun iya Re; ‘rora f’ogbe Re;
Irele n’nu ‘danwo; Iyin fun ‘ranwo.$verse_split$,
  $verse_split$Fun mi n’iwa funfun, fun mi n’isegun,
We abawon mi nu, fa ‘fe mi s’orun;
Mu mi ye ‘joba Re, ki nwulo fun O,
Ki nj’ alabukunfun; ki ndabi Jesu.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30065'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Alafia kio wa bi? Alafia ki... – II A. Oba 4:26.
Nipa ife Olugbala,
Ki y’o si nkan;
Oju rere Re ki pada,
Ki y’o si nkan;
Owon l’eje t’o wo wa san;
Pipe l’edidi or’ofe;
Agbara l’owo t’o gba ni;
Ko le si nkan.$verse_split$,
  $verse_split$Bi a wa ninu iponju,
Ki y’o si nkan;
Igbala kikun ni tiwa,
Ki y’o si nkan,
Igbekele Olorun dun;
Gbigbe inu Kristi l’ere,
Emi si nso wa di mimo,
Ko le si nkan.$verse_split$,
  $verse_split$Ojo ola yio dara,
Ki y’o si nkan,
‘Gbagbo le korin n’nu ‘ponju;
Ki y’o si nkan,
Agbekele ‘fe Baba wa;
Jesu nfun wa l’ohun gbogbo;
Ni yiye tabi ni kiku;
Ko le si nkan.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30066'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitoriti afi ipile re sole lori apata. – Mat. 7:25.
Igbagbo mi duro l’ori,
Eje at’ ododo Jesu,
Nko je gbekele ohun kan,
Leyin oruko nla Jesu.$verse_split$,
  $verse_split$Mo duro le Kristi Apata,
Ile miran, iyanrin ni.$verse_split$,
  $verse_split$B’ire-ije mi tile gun,
Or’-ofe Re ko yi pada;
B’o ti wu ki iji na le to;
Idakoro mi ko niye.$verse_split$,
  $verse_split$Mo duro le Kristi Apata,
Ile miran, iyanrin ni.$verse_split$,
  $verse_split$Majemu, ati eje Re,
L’em’o ro mo, bi ‘kun mi de;
‘Gbati ko s’atileyin mo,
On je ireti nla fun mi.$verse_split$,
  $verse_split$Mo duro le Kristi Apata,
Ile miran, iyanrin ni.$verse_split$,
  $verse_split$‘Gbat’ipe ‘keyin ba si dun,
A! Mba le wa ninu Jesu;
Ki nwo ododo Re nikan;
Ki nduro niwaju ite.$verse_split$,
  $verse_split$Mo duro le Kristi Apata,
Ile miran, iyanrin ni.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30067'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E ma si se fi aye fun esu. – Efe. 4:27.
Ma f’ara fun ‘danwo, nitor’ ese ni,
Isegun kan yo tun fun O l’agbara;
Ja bi okunrin, si bori ‘fekufe,
Sa tejumo Jesu, y’O mu o laja.$verse_split$,
  $verse_split$EGBE:
Bere ‘ranwo at’agbara lodo Olugbala,
O se tan fun iranwo, Oun y’O mu o la ja.$verse_split$,
  $verse_split$Ma kegbe buburu, ma soro ibi,
Mase pe oruko Olorun l’asan;
Je eni ti nronu at’olotito;
Sa tejumo Jesu, y’O mu o la ja.$verse_split$,
  $verse_split$EGBE:
Bere ‘ranwo at’agbara lodo Olugbala,
O se tan fun iranwo, Oun y’O mu o la ja.$verse_split$,
  $verse_split$Olorun y’O f’ade f’eni t’o segun,
Ao fi ‘gbagbo segun, b’ota nde si wa;
Kristi y’O so agbara wa di otun,
Sa tejumo Jesu, y’O mu o la ja.$verse_split$,
  $verse_split$EGBE:
Bere ‘ranwo at’agbara lodo Olugbala,
O se tan fun iranwo, Oun y’O mu o la ja.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30068'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Bere a o si fifun nyin. – Mat. 7:7.
Y’o dahun gbogb’ adura;
Ileri ati ‘fe Re,
Ko sa ti yi pada ri;
Ogo f’oko Re.$verse_split$,
  $verse_split$Y’o dahun gbogb’ adura;
Uno ro mo ileri Re,
Mo mo On ko je da mi,
Ogo f’oko Re.$verse_split$,
  $verse_split$Y’o dahun gbogb’adura;
Je ka bere ni ‘gbagbo,
Emi Re nran ni lowo;
Ogo foko Re.$verse_split$,
  $verse_split$Y’o dahun gbogb’ adura,
Wa sibi ite anu;
O ri idaniloju;
Ogo foko Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30069'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Olorun mi, eniti emi gbekele. – OD. 91:2.
Sa gbekele l’ojojo;
Gbekele l’arin ‘danwo,
Bi ‘gbagbo tile kere;
Gbekele Jesu nikan.$verse_split$,
  $verse_split$EGBE:
Gbekele ni ‘gbagbogbo,
Gbekele lojojumo;
Gbekele lonakona,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$Emi Re ntan Imole,
Si ona okunkun mi;
L’owo Re, nko le subu,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$EGBE:
Gbekele ni ‘gbagbogbo,
Gbekele lojojumo;
Gbekele lonakona,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$B’ona ba mo uno ko’rin,
B’o ba di, uno gbadura;
Larin ewu, uno ke pe,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$EGBE:
Gbekele ni ‘gbagbogbo,
Gbekele lojojumo;
Gbekele lonakona,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$Gbekele titi d’opin,
Tit’aye yo fi koja;
Ti ao si de ‘nu ogo,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$EGBE:
Gbekele ni ‘gbagbogbo,
Gbekele lojojumo;
Gbekele lonakona,
Gbekele Jesu nikan.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30070'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Alabukun fun li awon ti ko ri mi ti won si gbagbo. – Jn. 20:29.
Aigbagbo bila! Temi l’Oluwa,
Oun O si dide fun igbala mi;
Ki nsa ma gbadura, Oun O se ‘ranwo,
‘Gba Krist’ wa lodo mi ifoya ko si.$verse_split$,
  $verse_split$B’ona mi ba su, Oun l’O sa nto mi,
Ki nsa gboran sa, Oun o si pese;
Bi iranlowo eda gbogbo saki,
Oro t’enu Re so, yo bori dandan.$verse_split$,
  $verse_split$Ife t’O fi han ko je ki nro pe;
Y’O fi mi sile ninu wahala;
Iranwo ti mo si nri lojojumo,
O nki mi l’aya pe, emi o la ja.$verse_split$,
  $verse_split$Emi o se kun ‘tori iponju,
Tabi irora, O ti so tele,
Mo m’oro Re p’awon ajogun ‘gbala,
Won ko le sai koja larin wahala.$verse_split$,
  $verse_split$Eda ko le so kikoro ago;
T’Olugbala mu k’elese le ye;
Aye Re tile buru ju temi lo;
Jesu ha le jiya, kemi si ma sa?$verse_split$,
  $verse_split$Nje b’ohun gbogbo ti nsise ire,
Fun awon to duro de Oluwa,
B’ oni tile koro, sa ko ni pe mo,
‘Gba na orin’segun yi o ti dun to?$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30071'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Iwo o pa a mo li alafia pipe. – Isa. 26:3.
Alafia li aye ese yi?
Eje Jesu nwipe, “Alafia”.$verse_split$,
  $verse_split$Alafia ninu opo lala?
Lati se ife Jesu, ni simi.$verse_split$,
  $verse_split$Alafia n’nu igbi ‘banuje?
L’aya Jesu ni ‘dake roro wa.$verse_split$,
  $verse_split$Alafia, ‘gb’ara wa wa l’ajo?
Ni ‘pamo Jesu iberu ko si.$verse_split$,
  $verse_split$Alafia, ba ko tile m’ola?
A mo pe Jesu joba titi lae.$verse_split$,
  $verse_split$Alafia, nigb’akoko iku?
Olugbala wa ti segun iku.$verse_split$,
  $verse_split$O to! Jakadi aye fere pin,
Jesu y’O pe wa s’orun alafia.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30072'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oju wan wo Oluwa Olorun wa. – OD. 123:2.
Igbagbo mi wo O;
Iwo Od’agutan;
Olugbala,
Jo, gbo adura mi,
M’ese mi gbogbo lo;
K’emi lat’oni lo,
Si je Tire.$verse_split$,
  $verse_split$Ki ore-ofe Re,
F’ilera f’okan mi;
Mu mi tara;
B’Iwo ti ku fun mi,
A! K’ife mi si O,
K’o ma gbona titi;
B’ina iye.$verse_split$,
  $verse_split$‘Gba mo nrin l’okunkun;
Ninu ibanuje,
S’amona mi;
So okun di ‘mole;
Pa ‘banuje mi re,
Ki nma sako kuro;
Li odo Re.$verse_split$,
  $verse_split$Gba ti aye ba pin,
T’odo tutu iku;
Nsan l’ori mi,
Jesu, ninu ife,
Mu k’ifoya mi lo,
Gbe mi d’oke orun;
B’okan t’ara.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30073'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ipase Re li a ko si mo. – OD. 77:19.
Ona ara l’Olorun wa,
Ngba sise Re l’aye;
A nri ‘pase Re lor’okun,
O ngun igbi l’esin.$verse_split$,
  $verse_split$Ona Re, enikan ko mo,
Awamaridi ni;
O pa ise ijinle mo,
Oba awon oba.$verse_split$,
  $verse_split$Ma beru mo, eyin mimo,
Orun to su be ni,
O kun fun anu yo rojo;
Ibukun s’ori yin.$verse_split$,
  $verse_split$Mase da Oluwa l’ejo,
Sugbon gbeke re le;
‘Gbati o ro pe O nbinu,
Inu Re yo si o.$verse_split$,
  $verse_split$Ise Re fere ye wa na,
Y’o ma han siwaju;
Bi o tile koro loni,
O mbo wa dun lola.$verse_split$,
  $verse_split$Afoju ni alaigbagbo,
Ko mo ‘se Olorun;
Olorun ni Olutumo,
Y’O m’ona Re ye ni.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30074'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ore ofe mi to fun o. – II Kor. 12:9.
Awon to gbekele Oluwa,
Yio bori igbi idanwo;
Nitori ileri yi daju,
Ore-ofe mi to fun o.$verse_split$,
  $verse_split$EGBE:
Ore-ofe mi to fun o,
Ore-ofe mi to fun o;
Ore-ofe ti ko l’egbe:
Ore-ofe mi to fun o.$verse_split$,
  $verse_split$Manna lat’orun li eyi je;
Fun awon ero mimo l’ona,
T’eru npa, to si nwa isimi,
Ore-ofe Mi to fun o.$verse_split$,
  $verse_split$EGBE:
Ore-ofe mi to fun o,
Ore-ofe mi to fun o;
Ore-ofe ti ko l’egbe:
Ore-ofe mi to fun o.$verse_split$,
  $verse_split$Larin ire ije ti iye,
Bi are tile mu o subu:
Tun dide, ko si te siwaju;
Ore-ofe Mi to fun o.$verse_split$,
  $verse_split$EGBE:
Ore-ofe mi to fun o,
Ore-ofe mi to fun o;
Ore-ofe ti ko l’egbe:
Ore-ofe mi to fun o.$verse_split$,
  $verse_split$Idanwo ati iyemeji,
At’ewu ko le ba ni l’eru;
‘Tori mo di ileri yi mu:
Ore-ofe Mi to fun o.$verse_split$,
  $verse_split$EGBE:
Ore-ofe mi to fun o,
Ore-ofe mi to fun o;
Ore-ofe ti ko l’egbe:
Ore-ofe mi to fun o.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30075'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Bi iwo ba gbagbo, iwo o ri ogo Olorun. – Jn. 11:40.
B’o ti dun lati gba Jesu,
Gbo gegebi oro Re;
K’a simi lor’ ileri Re,
Sa gbagbo l’Oluwa wi.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, emi gbagbo,
Mo gbekele n’gbagbogbo,
Jesu, Jesu, Alabukun;
Ki nle gbekele O si.$verse_split$,
  $verse_split$B’o ti dun lati gba Jesu,
K’a gb’eje ‘wenumo Re;
Igbagbo ni ki a fi bo,
Sin ‘eje wenumo na.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, emi gbagbo,
Mo gbekele n’gbagbogbo,
Jesu, Jesu, Alabukun;
Ki nle gbekele O si.$verse_split$,
  $verse_split$B’o ti dun lati gba Jesu,
Ki nk’ara ese sile,
Ki ngb’ayo, iye, isimi;
Lati odo Jesu mi.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, emi gbagbo,
Mo gbekele n’gbagbogbo,
Jesu, Jesu, Alabukun;
Ki nle gbekele O si.$verse_split$,
  $verse_split$Mo yo mo gbeke mi le O,
Jesu mi, Alabukun;
Mo mo pe O wa pelu mi,
Ntoju mi titi dopin.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, emi gbagbo,
Mo gbekele n’gbagbogbo,
Jesu, Jesu, Alabukun;
Ki nle gbekele O si.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30076'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Olorun ayeraye ni ibugbe Re. – Deut. 33:27.
Laifoya l’apa Jesu,
Laifoya l’aya Re;
Labe ojij’ ife Re,
L’okan mi o simi;
Gbo! Ohun angeli ni,
Orin won d’eti mi;
Lati papa ogo wa,
Lati okun Jaspa;
L’aifoya l’apa Jesu,
L’aifoya l’aya Re,
L’abe ojij’ ife Re;
L’okan mi o simi.$verse_split$,
  $verse_split$L’aifoya l’apa Jesu,
Mo bo low’ aniyan;
Mo bo lowo idanwo,
Ese ko nipa mo;
Mo bo lowo ‘banuje,
Mo bo lowo eru;
O ku idanwo die,
O k’omije die,
Laifoya l’apa Jesu;
Laifoya l’aya Re;
L’abe ojij’ ife Re,
L’okan mi o simi.$verse_split$,
  $verse_split$Jesu, abo okan mi,
Jesu ti ku fun mi;
Apata ayeraye,
L’emi o gbekele;
Nihin l’emi o duro,
Tit’ oru y’o koja;
Titi uno fi ri ‘mole,
Ni ebute ogo;
Laifoya l’apa Jesu,
Laifoya l’aya Re,
L’abe ojij’ ife Re;
L’okan mi Osimi.$verse_split$,
  $verse_split$2. L’aifoya l’apa Jesu,
Mo bo low’ aniyan;
Mo bo lowo idanwo,
Ese ko nipa mo;
Mo bo lowo ‘banuje,
Mo bo lowo eru;
O ku idanwo die,
O k’omije die,
Laifoya l’apa Jesu;
Laifoya l’aya Re;
L’abe ojij’ ife Re,
L’okan mi o simi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30077'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oruko Re dabi ikunra ti a tu jade. – O. Sol. 1:3.
B’oruko Jesu ti dun to,
L’eti onigbagbo;
O tan ‘banuje on ogbe,
O le eru re lo.$verse_split$,
  $verse_split$O wo okan t’o gb’ogbe, san,
O mu aya bale;
Manna ni fun okan ebi,
Isimi f’alare.$verse_split$,
  $verse_split$Apata ti mo kole le,
Ibi isadi mi;
Ile isura mi t’o kun;
F’opo ore-ofe.$verse_split$,
  $verse_split$Jesu, oko mi, ore mi,
Woli mi, Oba mi,
Alufa mi, Oba iye,
Gbo orin iyin mi.$verse_split$,
  $verse_split$Ailera l’agbara ‘nu mi;
Tutu si l’ero mi,
‘Gba mo ba ri O b’O ti ri,
Uno yin O b’o ti ye.$verse_split$,
  $verse_split$Tit’ igba na, ni ohun mi,
Y’o ma royin ‘ fe Re;
Nigba iku k’oruko Re,
F’itura f’okan mi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30078'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Jesu so fun won pe, Emi wa pelu yin nigbagbogbo, titi o fide opin aye. – Mat. 28:20.
Ore bi Jesu kosi laye yi,
Oun nikan l’ore otito,
Ore aye yi y’o fi wa sile;
Sugbon Jesu ko je gbagbe wa.$verse_split$,
  $verse_split$EGBE:
Ah! Ko je gbagbe wa;
Ah! Ko je gbagbe wa;
Sugbon Jesu ko je gbagbe wa.$verse_split$,
  $verse_split$Akoko nkoja lo laifota pe;
A f’ojo kan sunmole wa si;
Onidajo mbo, gongo yi o so;
Awawi kan kosi l’ojo na.$verse_split$,
  $verse_split$EGBE:
Ah! Ko je gbagbe wa;
Ah! Ko je gbagbe wa;
Sugbon Jesu ko je gbagbe wa.$verse_split$,
  $verse_split$Duro d’Oluwa, ma siyemeji,
Ohunkohun t’o wu ko le de;
‘Gbat’ o ro p’o pin ‘ranwo Re y’o de;
Eni ‘yanu l’Oba Oluwa.$verse_split$,
  $verse_split$EGBE:
Ah! Ko je gbagbe wa;
Ah! Ko je gbagbe wa;
Sugbon Jesu ko je gbagbe wa.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30080'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nitoripe bi o wu ki ileri Olorun pe to, ninu Re ni beni ati ninu Re ni Amin, si ogo Olorun nipase wa. – II Kor. 1:20.
Mo nduro lori ileri Krist’ Oba,
Eniti a o ma yin titi laelae;
Ogo f’Olorun, emi yo ma korin;
Mo nduro lori ileri Re.$verse_split$,
  $verse_split$EGBE:
Emi nduro;
(Mo nduro de ‘leri, Mo nduro de ‘leri)
Emi nduro lori ileri Oluwa;
Emi nduro,
Emi nduro,
Emi nduro lori ileri Re.$verse_split$,
  $verse_split$Mo nduro le ileri ti ko le ye,
Gbati iji ‘yemeji at’ eru ba de;
Nipa Oro Re li emi yo segun,
Mo nduro lori ileri Re.$verse_split$,
  $verse_split$EGBE:
Emi nduro;
(Mo nduro de ‘leri, Mo nduro de ‘leri)
Emi nduro lori ileri Oluwa;
Emi nduro,
Emi nduro,
Emi nduro lori ileri Re.$verse_split$,
  $verse_split$Ileri Re la mi loju lati ri;
Iwenumo pipe ninu eje Re,
Ileri Re so okan mi d’om’nira;
Mo nduro lori ileri Re.$verse_split$,
  $verse_split$EGBE:
Emi nduro;
(Mo nduro de ‘leri, Mo nduro de ‘leri)
Emi nduro lori ileri Oluwa;
Emi nduro,
Emi nduro,
Emi nduro lori ileri Re.$verse_split$,
  $verse_split$Mo nduro le ileri Krist’ Oluwa,
Ife lo fi so mi po mo ara Re;
Nipa oro Re mo nsegun lojojo;
Mo nduro lori ileri Re.$verse_split$,
  $verse_split$EGBE:
Emi nduro;
(Mo nduro de ‘leri, Mo nduro de ‘leri)
Emi nduro lori ileri Oluwa;
Emi nduro,
Emi nduro,
Emi nduro lori ileri Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30081'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ore kan nbe ti o fi ara konrin lo. – Owe 18:24.
Ko s’ ore be Jesu onirele,
Ko s’ ore bi ti Re;
Ko s’ onisegun to le w’ese san,
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$EGBE:
Jesu mo gbogbo ‘jakadi wa,
Y’o ran wa lowo de opin;
Ko s’ ore bi Jesu onirele;
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$Kos’ ore to ga bi Re ni mimo;
Ko s’ ore bi ti Re,
Ko s’ ore to n’irele bi ti Re,
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$EGBE:
Jesu mo gbogbo ‘jakadi wa,
Y’o ran wa lowo de opin;
Ko s’ ore bi Jesu onirele;
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$Ko s’ akoko kan ti ko sunmo wa;
Ko s’ ore bi ti Re,
Ninu ‘danwo y’o ma tu wa ninu,
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$EGBE:
Jesu mo gbogbo ‘jakadi wa,
Y’o ran wa lowo de opin;
Ko s’ ore bi Jesu onirele;
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$Awon t’o gbagbo mo L’Eni rere;
Kos’ore bi ti Re,
Awon t’o wa lode ngbohun ‘fe Re,
Kos’ore bi ti Re.$verse_split$,
  $verse_split$EGBE:
Jesu mo gbogbo ‘jakadi wa,
Y’o ran wa lowo de opin;
Ko s’ ore bi Jesu onirele;
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$Ebun kan ha wa to ju Jesu lo?
Ko s’ ore bi ti Re;
Y’o ha ko fun wa k’a n’ile l’orun?
Ko je ko! Ko je ko!$verse_split$,
  $verse_split$EGBE:
Jesu mo gbogbo ‘jakadi wa,
Y’o ran wa lowo de opin;
Ko s’ ore bi Jesu onirele;
Ko s’ ore bi ti Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30082'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Nibiti eni meji, tabi meta ba ko ara won jo li oruko Mi, nibe li Emi o wa li arin won. – Mat. 18:20.
Jesu, ni b’eni Re pade,
Nibe, won r’ite anu Re,
Nibe, won wa O, won ri O;
Ibikibi ni ‘le owo.$verse_split$,
  $verse_split$Ko s’ogiri t’o se O mo,
O ngbe inu onirele;
Won mu O wa! Bi won ba wa,
‘Gba won nlo ‘le, won mu O lo.$verse_split$,
  $verse_split$Olus’agutan eni Re,
So anu Re ‘gbani d’otun;
So adun oruko nla Re,
Fun okan ti nwa oju Re.$verse_split$,
  $verse_split$Je k’a ripa adua nihin,
Lati so ‘gbagbo di lile;
Lati gbe ife wa soke,
Lati gb’orun ka ‘waju wa.$verse_split$,
  $verse_split$Oluwa ‘Wo wa nitosi,
N’apa Re, de ‘ti Re sile;
Si orun, sokale kankan;
Se gbogbo okan ni Tire.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30083'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oro mi li enyin ise. – Jn. 15:14.
Ore wo l’a ni bi Jesu,
Ti o ru ‘banuje wa;
Anfani wo l’o po bayi;
Lati ma gbadura si?
Alafia pupo l’a nsonu,
A si ti je ‘rora po,
N’tori a ko nfi gbogbo kan;
S’adura niwaju Re.$verse_split$,
  $verse_split$Idanwo ha wa fun wa bi?
A ha ni wahala bi?
A ko gbodo so reti nu,
Sa gbadura s’Oluwa,
Ko s’oloto ore bi Re;
Ti o le ba wa daro,
Jesu ti mo ailera wa,
Sa gbadura s’Oluwa.$verse_split$,
  $verse_split$Eru ha nwo wa l’orun bi?
Aniyan ha po fun wa?
Olugbala je abo wa,
Sa gbadura s’Oluwa;
Awon ore ha sa O ti?
Sa gbadura s’Oluwa,
Y’o gbe o s’oke l’apa Re,
Iwo y’o si ni ‘tunu.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30084'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$O ye ki enia ma gbadura nigbagbogbo lai simi ati lai sare. – Lk. 18:1
Ma gbadura; Emi mbebe, n’nu re,
Fun gbogbo aini re igba-gbogbo.$verse_split$,
  $verse_split$Ma gbadura; l’abe eru ese,
Adura nri eje Jesu ti nsan.$verse_split$,
  $verse_split$Ma gbadura; b’are tile mu O,
Adura ngbe wa s’eba ‘te Baba.$verse_split$,
  $verse_split$Ma gbadura; n’nu wahala aye,
Adura l’o nfun okan n’isimi.$verse_split$,
  $verse_split$Ma gbadura; b’ayo ba yi o ka,
Adura nlu harp o nkorin angel’.$verse_split$,
  $verse_split$Ma gbadura b’awon t’o feran ku,
Adura mba won mu omi iye.$verse_split$,
  $verse_split$Gbogb’ ohun aye y’o b’aye koja,
Adura wa titi; ma gbadura.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30085'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Enikeni ti o ba pe oruko Oluwa li a o gbala. – Joe. 2:32
Ma koja mi, Olugbala,
Gbo adura mi;
‘Gbat’ Iwo ba np’ elomlran,
Mase koja mi.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, gbo adura mi;
‘Gbat’ Iwo ba np’elomiran,
Mase koju mi.$verse_split$,
  $verse_split$N’ite anu, Je k’emi ri;
Itura didun,
T’edun t’edun ni mo wole;
Jo, ran mi lowo.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, gbo adura mi;
‘Gbat’ Iwo ba np’elomiran,
Mase koju mi.$verse_split$,
  $verse_split$N’igbekele itoye Re,
L’em’ o w’oju Re;
Wo ‘banuje okan mi san,
F’ife Re gba mi.$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, gbo adura mi;
‘Gbat’ Iwo ba np’elomiran,
Mase koju mi.$verse_split$,
  $verse_split$4.’Wo orisun itunu mi,
Ju ‘ye fun mi lo,
Tani mo ni l’aye lorun;
Bikose iwo?$verse_split$,
  $verse_split$EGBE:
Jesu, Jesu, gbo adura mi;
‘Gbat’ Iwo ba np’elomiran,
Mase koju mi.$verse_split$,
  $verse_split$Amin$verse_split$
]::text[]
WHERE hymn_number = '30086'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ki ore-ofe Oluwa wa Jesu Kristi ki o wa pelu nyin. – I Tes. 5:28.
Fi ibukun Re tu wa ka,
Fi ayo kun okan wa;
K’olukuluku mo ‘fe Re;
K’a l’ayo n’nu ore Re;
Tu wa lara tu wa l’ara,
La aginju aye ja.$verse_split$,
  $verse_split$Ope at’ iyin l’a nfun O,
Fun ihinrere ayo;
Je ki eso igbala Re,
Po l’okan at’iwa wa;
Ki oju Re, ki oju Re;
Ma ba wa gbe titi lo.$verse_split$,
  $verse_split$Nje n’igbat’ a ba si pe wa,
Lati f’aye yi sile;
K’Angeli gbe wa lo s’orun,
L’ayo ni k’a j’ ipe na;
K’a si joba, k’a si joba;
Pelu Kristi titi lae.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30087'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ma fi mi sile, beni ki o mase ko mi, Olorun igbala mi. – OD. 27:9.
Mo nfe O n’gbagbogbo,
‘Wo Olore;
K’o s’ohun bi Tire;
T’yo m’alafia wa.$verse_split$,
  $verse_split$EGBE:
Mo nfe O, A! Mo nfe O,
Ni wakati gbogbo;
Bukun mi, Olugbala!
Mo wa s’odo Re.$verse_split$,
  $verse_split$Mo nfe O n’gbagbogbo;
Duro ti mi;
Idanwo ko n’ipa,
B’o wa n’tosi.$verse_split$,
  $verse_split$EGBE:
Mo nfe O, A! Mo nfe O,
Ni wakati gbogbo;
Bukun mi, Olugbala!
Mo wa s’odo Re.$verse_split$,
  $verse_split$Mo nfe O n’gbagbogbo;
L’ayo, n’ise,
Yara wa ba mi gbe,
Asan l’aye.$verse_split$,
  $verse_split$EGBE:
Mo nfe O, A! Mo nfe O,
Ni wakati gbogbo;
Bukun mi, Olugbala!
Mo wa s’odo Re.$verse_split$,
  $verse_split$Mo nfe O n’gbagbogbo:
Ko mi n’ife Re;
Mu ileri Re se,
Si mi l’ara.$verse_split$,
  $verse_split$EGBE:
Mo nfe O, A! Mo nfe O,
Ni wakati gbogbo;
Bukun mi, Olugbala!
Mo wa s’odo Re.$verse_split$,
  $verse_split$Mo nfe O n’gbagbogbo,
Eni Mimo,
Se mi n’Tire toto;
Omo ‘bukun!$verse_split$,
  $verse_split$EGBE:
Mo nfe O, A! Mo nfe O,
Ni wakati gbogbo;
Bukun mi, Olugbala!
Mo wa s’odo Re.$verse_split$,
  $verse_split$Amin$verse_split$
]::text[]
WHERE hymn_number = '30088'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Iwo o fi imo Re to mi li ona ati nigbehin Iwo o gba mi sinu ogo. – OD. 73:24.
Ma toju mi, Jehoha nla,
Ero l’aye osi yi,
Emi ko l’okun, Iwo ni;
F’ow’ agbara di mi mu,
Onje orun, onje orun,
Ma bo mi titi laelae.$verse_split$,
  $verse_split$S’ilekun isun ogo ni;
Orisun im’arale;
Je ki imole Re orun,
Se amona mi jale;
Olugbala, Olugbala,
S’ agbara at’ asa mi.$verse_split$,
  $verse_split$‘Gba mo ba de eba Jordan;
F’okan eru mi bale,
Iwo t’o ti segun iku,
Mu mi gunle Kenan je;
Orin iyin, Orin iyin,
L’emi o fun O titi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30089'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Wakati adura. – Ise. A. 3:1.
Wakati adura didun!
T’o gbe mi lo kuro l’aye,
Lo ‘waju ite Baba mi,
Ki nso gbogbo edun mi fun;
Nigba ‘banuje at’ aro,
Adua l’abo fun okan mi;
Emi si bo lowo esu;
‘Gbati mo ba gb’adua didun.$verse_split$,
  $verse_split$Wakati adura didun,
Iye Re y’o gbe ebe mi;
Lo sod’ Eni t’O se ‘leri;
Lati bukun okan adu’a,
B’O ti ko mi ki nw’oju Re,
Ki ngbekele, ki nsi gba gbo;
Uno ko gbogb’ aniyan mi le;
Ni akoko adua didun.$verse_split$,
  $verse_split$Wakati adura didun,
Je ki nma r’itunu Re gba;
Titi uno fi d’oke Pisga,
Ti uno r’ile mi l’ okere;
Uno bo ago ara sile,
Uno gba ere ainipekun,
Un o korin bi mo ti nfo lo!
O digbose adua didun.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30090'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Mo ti gbadura fun o ki igbagbo re ma se ye. – Lk. 22:32.
Jesu nigba ‘danwo,
Gbadura fun mi;
K’emi ma ba se O,
Ki nsi sako lo,
‘Gba mba s’iyemeji;
Ko b’oju wo mi,
K’eru tab’ isaju,
Ma mu mi subu.$verse_split$,
  $verse_split$B’aye ba si nfa mi;
Pelu adun re,
T’ohun ‘sura aye,
Fe han mi l’emo,
Jo mu Getsemani;
Wa s’iranti mi,
Tabi irora Re,
L’oke Kalfari.$verse_split$,
  $verse_split$B’O ba pon mi l’oju;
Ninu ife Re,
Da ibukun Re le,
Ori ebo na;
Ki nf’ ara mi fun O,
L’ori pepe Re:
B’ara ko ago na,
Lgbagbo y’o mu.$verse_split$,
  $verse_split$‘Gba mo ba nre ‘boji,
Sinu ekuru;
T’ogo orun si nko,
L’eti bebe na;
Un o gbekel’ oto Re;
Ni ‘jakadi ‘ku;
Oluwa gb’emi mi,
S’iye ailopin.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30091'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E wa sodo mi gbogbo Enyin ti n sise, Emi o si fi isimi fun yin. Mat. 11:28
Wa gba isimi re,
Mase je ‘rora mo,
Wa s’odo Jesu re,
Ma se jafara,$verse_split$,
  $verse_split$EGBE:
Adura, ng’oke lo,
Angel’ nteri won ba,
Aye dapo mo won,
Mase jafara.$verse_split$,
  $verse_split$Okunkun l’aye yi
Lala inu re po,
Wa s’agb’ Olugbala
Mase jafara.$verse_split$,
  $verse_split$EGBE:
Adura, ng’oke lo,
Angel’ nteri won ba,
Aye dapo mo won,
Mase jafara.$verse_split$,
  $verse_split$Gb’eru ese re wa,
Jesu ti ku fun o,
On y’o t’ewo gba o,
Mase jafara.$verse_split$,
  $verse_split$EGBE:
Adura, ng’oke lo,
Angel’ nteri won ba,
Aye dapo mo won,
Mase jafara.$verse_split$,
  $verse_split$Igba ko duro pe,
Wawa l’akoko nlo,
Idajo si mbo wa,
Mase jafara.$verse_split$,
  $verse_split$EGBE:
Adura, ng’oke lo,
Angel’ nteri won ba,
Aye dapo mo won,
Mase jafara.$verse_split$,
  $verse_split$Wa, awa mbe o, wa;
Wa, ye gb’oke gb’odo;
Wa mura fun ile,
Mase jafara.$verse_split$,
  $verse_split$EGBE:
Adura, ng’oke lo,
Angel’ nteri won ba,
Aye dapo mo won,
Mase jafara.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30092'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Emi o si bere lowo Baba, On O si fun yin li Olutunu miran. – Jn. 14:16.
Tan ihin na kale, jakejado aye,
K’awon ti eru npa, mo pe igbala de:
K’awon ti se ti Krist’, so ihin ayo na,
Olutunu ti de.$verse_split$,
  $verse_split$EGBE:
Olutunu ti de, Olutunu ti de,
Emi lat’ oke wa, ileri Baba wa;
Tan ihin na kale, jakejado aye,
Olutunu ti de.$verse_split$,
  $verse_split$Oba awon oba, wa f’iwosan fun wa,
O wa ja ide wa, O mu igbala wa,
K’olukuluku wa, korin isegun pe:
Olutunu ti de.$verse_split$,
  $verse_split$EGBE:
Olutunu ti de, Olutunu ti de,
Emi lat’ oke wa, ileri Baba wa;
Tan ihin na kale, jakejado aye,
Olutunu ti de.$verse_split$,
  $verse_split$Ife iyanu nla, a! Mba le royin na,
Fun gbogbo eniyan, ebun or’ofe Re;
Emi omo egbe, di omo igbala,
Olutunu ti de.$verse_split$,
  $verse_split$EGBE:
Olutunu ti de, Olutunu ti de,
Emi lat’ oke wa, ileri Baba wa;
Tan ihin na kale, jakejado aye,
Olutunu ti de.$verse_split$,
  $verse_split$Gbe orin ‘yin soke, s’Olurapada wa,
K’awon mimo loke, jumo ba wa gberin;
Yin ife Re titi, ife ti ko le ku,
Olutunu ti de.$verse_split$,
  $verse_split$EGBE:
Olutunu ti de, Olutunu ti de,
Emi lat’ oke wa, ileri Baba wa;
Tan ihin na kale, jakejado aye,
Olutunu ti de.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30093'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ji, ji, gbe agbara wo, Iwo apa Olorun. – Isa. 51:9.
Ji, apa Olorun, ko ji,
Gbe ‘pa Re wo, mi orile;
Ni sisin Re, je k’aye ri;
Isegun ise anu Re.$verse_split$,
  $verse_split$T’ite Re wi fun keferi,
“Emi Jehofa Olorun”;
Ohun Re yo d’ede won ru,
Yi o wo pepe won lule.$verse_split$,
  $verse_split$Ki ‘gb’ ojurere Sion’ de,
Ka m’eya Israel’ wa ‘le;
N’iyanu ka f’oju wa ri,
Keferi, Ju, l’agbo Jesu.$verse_split$,
  $verse_split$Olugbala kede ‘fe Re,
L’orile at’ ede gbogbo;
Ki gbogb’ ota wole fun O;
Ki won gba Jesu l’Oluwa.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30094'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Olorun si wipe, “Jeki imole ki o wa,” imole si wa. – Gen. 1:3.
Iwo ti okunkun;
Gb’oro agbara Re,
To si fo lo:
Gbo ti wa, a nbe O,
Nibit’ ihinrere;
Ko ti tan mole re,
K’imole wa.$verse_split$,
  $verse_split$‘Wo t’iye apa Re;
Mu iriran w’aye,
At’ilera:
Ilera ti inu;
Iriran ti okan;
Fun gbogbo eniyan,
K’imole wa.$verse_split$,
  $verse_split$Iwo Emi oto,
Ti o n f’iye fun wa,
Fo kakiri:
Gbe fitila anu;
Fo ka oju omi,
Ni ‘bi okunkun nla,
K’imole wa.$verse_split$,
  $verse_split$Metalokan Mimo,
Ogbon, ife, Ipa,
Alabukun!
B’igbi omi okun;
Ti nyi ni ipa re,
Be ka gbogbo aye,
K’imole wa.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30096'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ki ijoba Re de. – Mat. 6:11.
Krist’ ki ‘joba Re de,
Ki ase Re bere;
F’opa irin Re fo;
Gbogbo ipa ese.$verse_split$,
  $verse_split$Ijoba ife da?
Ati t’alafia;
‘Gba wo ni irira,
Yio tan bi t’orun?$verse_split$,
  $verse_split$Akoko na ha da;
T’ote yio pari;
Ika ati ‘reje,
Pelu ifekufe?$verse_split$,
  $verse_split$Oluwa, jo dide,
Wa n’nu agbara Re;
Fi ayo fun awa,
Ti o ns’aferi Re.$verse_split$,
  $verse_split$7Eda ngan oko Re,
Koko nje agbo Re,
Iwa ‘tiju pupo;
Nfihan pe ‘fe tutu.$verse_split$,
  $verse_split$Okun bole sibe,
Ni ile keferi,
Dide ‘Rawo oro,
Dide mase wo mo.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30097'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E ji iji ododo. – I Kor. 15:34.
Ji, so agbara Re d’otun,
Gbe ‘hamora ogun re wo;
A o segun gbogbo ota,
Kristi yo si joba.$verse_split$,
  $verse_split$EGBE:
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wa n’nu Re ko ye;
Krist’ y’o joba,
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wan’nu Re ko ye;
Krist’ y’o joba.$verse_split$,
  $verse_split$O ti pe t’awon omo Re,
Ti nse ‘yapa lori eko;
Won gbagbe pe l’ori ‘sokan,
Ni On lo aye Re.$verse_split$,
  $verse_split$EGBE:
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wa n’nu Re ko ye;
Krist’ y’o joba,
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wan’nu Re ko ye;
Krist’ y’o joba.$verse_split$,
  $verse_split$E papo li agbara Re,
Aye yin yoo si je ere;
Laipe e o ni isegun,
‘Tori Krist’ y’o joba.$verse_split$,
  $verse_split$EGBE:
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wa n’nu Re ko ye;
Krist’ y’o joba,
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wan’nu Re ko ye;
Krist’ y’o joba.$verse_split$,
  $verse_split$O ye ka sise f’Oluwa,
Ise wa ko ni je asan;
A ko gbodo pada s’ehin,
‘Tori Krist’ y’o joba.$verse_split$,
  $verse_split$EGBE:
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wa n’nu Re ko ye;
Krist’ y’o joba,
Krist’ y’o joba,
Krist’ y’o joba,
Ireti wan’nu Re ko ye;
Krist’ y’o joba.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30099'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E ma sowo titi emi o fi de. – Luk. 19:13.
Un o ha lo ni owo ofo?
Ki nlo pade Jesu be?
Nko iti eise ojo kan fun;
Nko iti mu enikan wa.$verse_split$,
  $verse_split$EGBE:
Un o ha lo ni owo ofo?
Un o ha pade Jesu be?
Ko si eso kan lowo mi,
Ti mo le mu pade Re?$verse_split$,
  $verse_split$Iku ko lo nderuba mi;
Tori Jesu ti gba mi,
Pe mo nlo ni owo ofo,
Iro yi mb’okan mi je.$verse_split$,
  $verse_split$EGBE:
Un o ha lo ni owo ofo?
Un o ha pade Jesu be?
Ko si eso kan lowo mi,
Ti mo le mu pade Re?$verse_split$,
  $verse_split$A! Akoko ti mo sonu;
Mba le pe won pada bo,
Mba fi won fun Oluwa mi,
Ife Re ni mo fe se.$verse_split$,
  $verse_split$EGBE:
Un o ha lo ni owo ofo?
Un o ha pade Jesu be?
Ko si eso kan lowo mi,
Ti mo le mu pade Re?$verse_split$,
  $verse_split$Enyin mimo, tara sise;
Sise, ‘gbati se osan,
Ki igbe aye yin to pin,
So eso fun Oluwa.$verse_split$,
  $verse_split$EGBE:
Un o ha lo ni owo ofo?
Un o ha pade Jesu be?
Ko si eso kan lowo mi,
Ti mo le mu pade Re?$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30100'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E lo wasu ihinrere fun gbogbo eda. – Mk. 16:15.
Yo awon ti nsegbe, sajo eni nku,
F’anu ja won kuro ninu ese;
Ke f’awon ti nsina gb’eni subu ro,
So fun won pe, Jesu le gba won la.$verse_split$,
  $verse_split$EGBE:
Yo awon ti nsegbe, sajo eni nku,
Alanu ni Jesu, yio gbala.$verse_split$,
  $verse_split$Bi won tile gan, sibe O nduro;
Lati gb’omo t’o ronupiwada;
Sa f’itara ro won, si ro won jeje,
On o dariji bi won je gbagbo.$verse_split$,
  $verse_split$EGBE:
Yo awon ti nsegbe, sajo eni nku,
Alanu ni Jesu, yio gbala.$verse_split$,
  $verse_split$Ero okan eda ti esu te pa,
Ni ore-ofe le tun mu pada;
Okan ti o gb’ogbe, t’a fowo ife,
At’inu rere soji, y’o korin.$verse_split$,
  $verse_split$EGBE:
Yo awon ti nsegbe, sajo eni nku,
Alanu ni Jesu, yio gbala.$verse_split$,
  $verse_split$Yo awon ti nsegbe – ise tire ni,
Oluwa yio f’agbara fun o;
Fi suru ro won pada s’ona toro,
So f’asako p’Olugbala ti ku.$verse_split$,
  $verse_split$EGBE:
Yo awon ti nsegbe, sajo eni nku,
Alanu ni Jesu, yio gbala.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30102'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Wasu oro na. – II Tim. 4:2.
Keferi nsegbe l’ojojo,
Egbegberun lo nkoja lo;
Mura Kristian s’ igbala won;
Wasu fun won, ki won to ku.$verse_split$,
  $verse_split$E yonda owo, at’ebun,
At’emi yin, ki won le ye;
Jesu se ohun nla fun yin,
Kil’ ohun te ki o se fun?$verse_split$,
  $verse_split$Emi Oluwa, fo kiri,
Jakejado ile aye;
Ko awon om’ Olorun jo;
Lati gbogbo oril’ ede.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30103'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Emi ti fe ofin Re to! – OD. 119:97.
Bibeli mimo t’orun,
Owon itura temi!
‘Wo ti nwi bi mo ti ri;
‘Wo ti nso bi mo ti wa.$verse_split$,
  $verse_split$‘Wo nko mi bi mo sina,
‘Wo nfi ‘fe Oluwa han;
‘Wo l’O si nto ese mi,
‘Wo l’O ndare, at’ebi.$verse_split$,
  $verse_split$‘Wo ni nma tu wa ninu,
Ninu wahala aye;
‘Wo nko ni nipa ‘gbagbo,
Pe, a le segun iku.$verse_split$,
  $verse_split$‘Wo l’O nso t’ayo ti mbo,
Ati ‘parun elese;
Bibeli mimo t’orun,
Owon isura temi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30109'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Oro Re ni fitila fun ese mi ati imolesi ipa ona mi. – OD. 119:105.
Jesu oro Re ye,
O si nto ‘sise wa,
Eni t’o ba gba gbo,
Y’o l’ayo oun ‘mole.$verse_split$,
  $verse_split$Nigb’ ota sunmo wa,
Oro Re l’odi wa;
Oro itunu ni,
Iko igbala ni.$verse_split$,
  $verse_split$B’igbi at’okunkun;
Tile bo wa mole;
‘Mole Re yo to wa,
Y’o si dabobo wa.$verse_split$,
  $verse_split$Tani le so ayo,
To le ka isura;
Ti oro Re nfi fun;
Okan onirele.$verse_split$,
  $verse_split$Oro anu o nfi,
‘Lera fun alaye;
Oro iye o nfi,
Itunu feni nku.$verse_split$,
  $verse_split$Awa iba le mo;
Eko ti O nkoni;
Ki a ba le fe O,
K’a si le sunmo O.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30110'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Ojo ibukun yio si ro. – Esek. 34:26.
Ojo ibukun y’o si ro;
Ileri ife l’eyi;
A o ni itura didun,
Lat’ odo Olugbala.$verse_split$,
  $verse_split$EGBE:
Ojo ibukun,
Ojo ibukun l’a nfe,
Iri anu nse yi wa ka;
Sugbon ojo l’antoro.$verse_split$,
  $verse_split$Ojo ibukun y’o si ro,
Isoji iyebiye;
L’ori oke on petele,
Iro opo ojo mbo.$verse_split$,
  $verse_split$EGBE:
Ojo ibukun,
Ojo ibukun l’a nfe,
Iri anu nse yi wa ka;
Sugbon ojo l’antoro.$verse_split$,
  $verse_split$Ojo ibukun y’o si ro,
Ran won si wa, Oluwa;
Fun wa ni itura didun,
Wa f’ola fun oro Re.$verse_split$,
  $verse_split$EGBE:
Ojo ibukun,
Ojo ibukun l’a nfe,
Iri anu nse yi wa ka;
Sugbon ojo l’antoro.$verse_split$,
  $verse_split$Ojo ibukun y’o si ro,
Iba je le ro loni!
B’a ti njewo f’Olorun wa;
T’a npe oruko Jesu.$verse_split$,
  $verse_split$EGBE:
Ojo ibukun,
Ojo ibukun l’a nfe,
Iri anu nse yi wa ka;
Sugbon ojo l’antoro.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30112'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Enoku si ba Olorun rin. – Gen. 5:24.
‘Gbat’ a b’Oluwa rin,
N’nu ‘mole oro Re;
Ona wa yio ti mole to!
‘Gbat’ a ba nse ‘fe Re,
On y’o ma ba wa gbe,
Ati awon t’o gbeke won le.$verse_split$,
  $verse_split$EGBE:
Sagbekele,
Ona miran ko si;
Lati l’ayo n’nu Jesu,
Ju pe, ka gbekele.$verse_split$,
  $verse_split$Ko s’ohun to le de,
Loke tabi n’ile,
To le ko agbara Re l’oju;
Iyemeji, eru,
Ibanuje, ekun;
Ko le duro, bi a gbekele.$verse_split$,
  $verse_split$EGBE:
Sagbekele,
Ona miran ko si;
Lati l’ayo n’nu Jesu,
Ju pe, ka gbekele.$verse_split$,
  $verse_split$Ko si wahala mo,
Tabi ibanuje,
O ti san gbogbo ‘gbese wonyi;
Ko si aro kan mo,
Tabi ifajuro,
Sugbon ‘bukun b’a ba gbekele.$verse_split$,
  $verse_split$EGBE:
Sagbekele,
Ona miran ko si;
Lati l’ayo n’nu Jesu,
Ju pe, ka gbekele.$verse_split$,
  $verse_split$A ko le fenu so,
Bi ‘fe Re ti po to;
Titi ao fi fara wa rubo;
Anu ti On fihan,
At’ayo t’O nfun ni;
Je ti awon ti o gbekele.$verse_split$,
  $verse_split$EGBE:
Sagbekele,
Ona miran ko si;
Lati l’ayo n’nu Jesu,
Ju pe, ka gbekele.$verse_split$,
  $verse_split$Ni ‘dapo pelu Re,
Ao joko l’ese Re;
Tabi ki a ma rin pelu Re,
Awa yo gbo Tire,
Ao jise t’Oran wa,
Ma beru, sa gbekele nikan.$verse_split$,
  $verse_split$EGBE:
Sagbekele,
Ona miran ko si;
Lati l’ayo n’nu Jesu,
Ju pe, ka gbekele.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30113'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Beni Oluwa, Iwo mo pe, mo fe O. – Jn. 21:15.
Ki nfe O si Kristi,
Ki nfe O si!
Gb’adura ti mo ngba;
L’or’ ekun mi;
Eyi ni ebe mi;
Ki nfe O si Kristi:
Ki nfe O si,
Ki nfe O si.$verse_split$,
  $verse_split$L’ekan ohun aye,
Ni mo ntoro;
Nisiyi, ‘Wo nikan,
Ni emi nwa;
Eyi l’adura mi:
Ki nfe O si Kristi,
Ki nfe O si,
Ki nfe O si.$verse_split$,
  $verse_split$Je ki ‘banuje de,
At’irora;
Didun l’o jise Re,
At’ ise won;
‘Gba won mba mi korin:
Ki nfe O si Kristi,
Ki nfe O si,
Ki nfe O si.$verse_split$,
  $verse_split$Nje, opin emi mi;
Y’o jiyin Re,
Eyi y’o je oro,
Ikehin mi;
Adura mi y’o je:
Ki nfe O si Kristi,
Ki nfe O si,
Ki nfe O si.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30114'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Bi enikeni ba nsin mi ki o ma to mi lehin. – Jn. 12:26.
Jesu, mo ti se ‘leri,
Lati sin O d’opin;
Ma wa l’odo mi titi,
Baba mi, Ore mi;
Emi k’y’o beru ogun,
B’iwo ba sunmo mi,
Emi ki yo si sina;
B’O ba f’ona han mi.$verse_split$,
  $verse_split$Je ki nmo p’O sunmo mi;
Tori ‘baje aye;
Aye fe gba okan mi,
Aye fe tan mi je;
Ota yi mi kakiri,
L’ode ati ninu;
Sugbon Jesu sunmo mi,
Dabobo okan mi.$verse_split$,
  $verse_split$Jeki nma gbo ohun Re,
B’O ti mba mi soro,
Larin iji idanwo,
Aso at’agidi;
So, mu ko da mi loju,
K’okan mi ni ‘janu;
So, si mu mi gbo Tire,
‘Wo Olutoju mi.$verse_split$,
  $verse_split$Jesu,’wo ti se’leri;
F’awon t’o tele O,
Pe ibikibi t’O wa;
N’iranse Re yo wa;
Jesu, mo ti se ‘leri,
Lati sin O dopin,
Je ki nle to O leyin,
Baba mi, Ore mi.$verse_split$,
  $verse_split$Jeki nma ri ‘pase Re,
Ki nle ma tele O;
Nipa ‘gbara Re nikan,
Ni mo le tele O:
To mi, pe mi, si fa mi,
Di mi mu de opin;
Si gba mi si odo Re,
Baba mi, Ore mi.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30115'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$E duro ninu ife mi. – Jn. 15:9.
Jesu Oluwa, Oba mi;
Gb’ohun mi nigbati mo npe,
Gb’ohun mi lati ‘bugbe Re;
Ro ‘jo ore-ofe sile,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.$verse_split$,
  $verse_split$Jesu mo ti jafara ju;
Uno se le fe O, b’o ti ye,
Em’ o se le gb’ ogo Re ga;
Ati ewa oruko Re,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.$verse_split$,
  $verse_split$Jesu ki l’o ri ninu mi;
Ti ‘fe na fi po to bayi?
Ore Re si mi ti po to!
O ta gbogbo ero mi yo;
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.$verse_split$,
  $verse_split$2. Jesu mo ti jafara ju;
Uno se le fe O, b’o ti ye,
Em’ o se le gb’ ogo Re ga;
Ati ewa oruko Re,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.$verse_split$,
  $verse_split$Jesu ‘Wo o je orin mi,
Tire laya at’okan mi;
Tire ni gbogbo ini mi,
Olugbala, ‘Wo ni temi,
Oluwa mi, mo feran Re;
Je ki nle ma feran Re si.$verse_split$,
  $verse_split$2. Jesu mo ti jafara ju;
Uno se le fe O, b’o ti ye,
Em’ o se le gb’ ogo Re ga;
Ati ewa oruko Re,
Oluwa mi, mo feran Re,
Je ki nle ma feran Re si.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30116'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$Olorun si sure fun won. – Gen. 1:28.
Ire t’a su ni Eden,
N’igbeyawo ‘kini;
Ibukun t’a bukun won,
O wa sibe-sibe.$verse_split$,
  $verse_split$Sibe titi di oni,
N’igbeyawo Kristiani;
Olorun wa l’arin wa,
Lati sure fun wa.$verse_split$,
  $verse_split$Ire ki won le ma bi;
Ki won ko si ma re;
Ki won ni ‘dapo mimo,
T’enikan k’yo le tu.$verse_split$,
  $verse_split$Ba wa pe, Baba orun,
F’obirin yi f’oko;
Bi O ti fi Efa fun,
Adam l’ojo ‘kini.$verse_split$,
  $verse_split$Ba wa pe, Immanuel;
Si so owo won po;
B’eda meji ti papo,
L’ara ijinle Re.$verse_split$,
  $verse_split$Ba wa pe, Emi mimo;
F’ibukun Re fun won;
Si se won ni asepe,
Gege b’O ti ma nse.$verse_split$,
  $verse_split$Fi won s’abe abo Re,
K’ibi kan ma ba won;
‘Gba won npara ile Re,
Ma toju okan won.$verse_split$,
  $verse_split$Pelu won loj’ aye won,
At’ oko at’ aya;
Titi won o d’odo Re;
N’ile ayo l’orun.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30117'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;
UPDATE public.hymns
SET verses_yoruba = ARRAY[
  $verse_split$O ti dara, o si ti dun to fun awon ara lati ma jumo gbe ni irepo. – OD. 133:1.
O ti dara to lati ri;
Awon ara ni irepo,
T’ero at’ oro won j’okan,
Ti won nfi ‘gbagbo at’ ife,
Jumo nwa ohun ti orun,
Won nkede okiki Jesu.$verse_split$,
  $verse_split$Olorun, Olore-ofe,
T’inu re dun s’ isokan wa,
On f’ ayo busi ‘pade wa;
O nf’ itura mu wa soji;
O ntu ‘bukun Re sori wa,
O nfun wa n’ibale okan.$verse_split$,
  $verse_split$Jesu, Okuta igun ‘le;
Jek’ awon t’Emi Re dapo,
Ma wa n’nu isokan pipe;
Jek’ a ma gbe ‘nu Emi Re,
K’a f’apere ‘sokan mimo;
Lele fun ijo Re nihin.$verse_split$,
  $verse_split$Jek’ a ma fa mo ara wa,
F’ebun or’-ofe re fun wa;
Lati ma ya wa si mimo;
Titi ao fi d’eni pipe,
T’ao ba awon t’oke pade;
T’ao si ni ipo lodo Re.$verse_split$,
  $verse_split$Amin.$verse_split$
]::text[]
WHERE hymn_number = '30120'
  AND source_hymnal = 'Uploaded Yorùbá Hymn Collection'
  AND cardinality(verses_yoruba) = 1;

COMMIT;
