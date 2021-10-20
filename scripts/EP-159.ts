import { AuthUsers } from '../auth/schemas/authUsers';

async function run(done) {
    const users = AuthUsers.find({ documento: { $in: dnis } }).cursor({ batchSize: 100 });
    let i = 0;
    const promises = [];
    for await (const user of users) {
        i++;
        // eslint-disable-next-line no-console
        if (i % 100 === 0) { console.log(i); }
        const org = user.organizaciones.find(o => o._id.toString() === organizacionId);
        org.permisos = org.permisos.filter(p => !p.includes('epidemiologia:'));
        org.permisos = [...org.permisos, ...permisosEpidemiologia];
        promises.push(AuthUsers.update({ _id: user.id }, user));
    }
    await Promise.all(promises);
    done();
}

const permisosEpidemiologia = [
    'epidemiologia:create',
    'epidemiologia:update',
    'epidemiologia:read',
    'epidemiologia:historial',
    'epidemiologia:seguimiento:update'
];
// const organizacionId = Types.ObjectId("57e9670e52df311059bc8964");
const organizacionId = '57e9670e52df311059bc8964';
const dnis = [
    '34446988',
    '24027714',
    '27488840',
    '21785089',
    '24349355',
    '26530876',
    '29069535',
    '95924828',
    '31609357',
    '25939488',
    '24825211',
    '22537583',
    '20080338',
    '23578388',
    '28701052',
    '29547232',
    '21788563',
    '36841599',
    '34221432',
    '21526718',
    '22162125',
    '27457610',
    '31164716',
    '27367844',
    '29342890',
    '29342078',
    '33433319',
    '25308336',
    '27107384',
    '23394340',
    '40995174',
    '32694512',
    '13175583',
    '39129162',
    '27352168',
    '36256441',
    '38037714',
    '12130695',
    '25953324',
    '29973128',
    '29547044',
    '29213393',
    '17952528',
    '17442053',
    '23494881',
    '31198590',
    '21490772',
    '26810111',
    '22857282',
    '32978673',
    '20500618',
    '33046379',
    '32668147',
    '22851614',
    '26776993',
    '27723909',
    '23001714',
    '27327098',
    '25074673',
    '29168739',
    '13150829',
    '28989040',
    '23589489',
    '23210762',
    '29371570',
    '21387054',
    '28485174',
    '37175521',
    '25397968',
    '26313418',
    '26805955',
    '29757131',
    '28433118',
    '32910237',
    '29526338',
    '24671204',
    '26333973',
    '34406877',
    '28485161',
    '31796595',
    '30174857',
    '35466218',
    '94093605',
    '33620269',
    '34658813',
    '24547189',
    '30713433',
    '18885748',
    '28982237',
    '17112788',
    '27856026',
    '18888302',
    '26741974',
    '24937957',
    '20120953',
    '32895100',
    '32570486',
    '29079240',
    '33148790',
    '35663709',
    '29863579',
    '33447762',
    '34376698',
    '36800317',
    '32004579',
    '28349061',
    '36413567',
    '36784324',
    '28485423',
    '34221402',
    '34856264',
    '32957964',
    '36376557',
    '35438495',
    '32682027',
    '35514168',
    '36669394',
    '30022086',
    '34253251',
    '36718852',
    '37665039',
    '28623310',
    '34545635',
    '34807300',
    '38543002',
    '35655808',
    '35310867',
    '37621288',
    '37336649',
    '36138214',
    '27070893',
    '31615623',
    '33781726',
    '34658023',
    '33285619',
    '33745472',
    '32909500',
    '32731742',
    '29133310',
    '32438972',
    '34952799',
    '33579238',
    '36432954',
    '36785245',
    '33351305',
    '19053609',
    '33471031',
    '33291058',
    '33079711',
    '33551976',
    '31723410',
    '29845598',
    '35712926',
    '37748694',
    '34103409',
    '18896095',
    '33799003',
    '35381741',
    '36371944',
    '37666658',
    '33952651',
    '35776074',
    '34787338',
    '37015285',
    '34522107',
    '36433896',
    '38083751',
    '34663161',
    '36329442',
    '34657424',
    '35747241',
    '37557788',
    '37604122',
    '37359486',
    '34866080',
    '36435030',
    '39122599',
    '37573340',
    '33467221',
    '34811127',
    '33952507',
    '35187512',
    '32722537',
    '32539053',
    '33566678',
    '35337864',
    '34220204',
    '33180104',
    '32779022',
    '36510060',
    '38204305',
    '36784323',
    '35610229',
    '37858129',
    '37535950',
    '37544353',
    '95889880',
    '32922234',
    '24739301',
    '34087694',
    '33952153',
    '33205118',
    '34220368',
    '33953496',
    '36853781',
    '31671297',
    '34525413',
    '32606448',
    '32694240',
    '30299532',
    '30624974',
    '32568315',
    '32128898',
    '19007446',
    '31763382',
    '37350957',
    '37006545',
    '31985116',
    '33924281',
    '33984827',
    '38010110',
    '34657796',
    '35651596',
    '37702693',
    '33637171',
    '36800116',
    '37474736',
    '27932932',
    '31293026',
    '34667145',
    '37035672',
    '37239887',
    '37943587',
    '38153402',
    '37303504',
    '34292418',
    '36731011',
    '37231604',
    '26810649',
    '94346371',
    '35592759',
    '37614466',
    '37771322',
    '37013907',
    '95609465',
    '31138367',
    '37173266',
    '37555768',
    '37946458',
    '35413170',
    '39680530',
    '34928534',
    '32829678',
    '32049510',
    '31709279',
    '34745778',
    '33677872',
    '34397469',
    '31504663',
    '29140572',
    '31836703',
    '30422735',
    '36433662',
    '37665514',
    '36371168',
    '37006473',
    '33237971',
    '33835680',
    '35979830',
    '36692966',
    '35281558',
    '36435363',
    '28516241',
    '29547570',
    '34001717',
    '35550848',
    '36208157',
    '34602841',
    '37461836',
    '30093475',
    '31240591',
    '37857761',
    '39256233',
    '35195734',
    '33185066',
    '36771148',
    '35492913',
    '32293196',
    '33291446',
    '37853000',
    '37046705',
    '36720510',
    '38710846',
    '35597203',
    '36841926',
    '37281673',
    '37657774',
    '38715954',
    '32902323',
    '31058335',
    '34767173',
    '34658526',
    '33291934',
    '34173720',
    '33813553',
    '32608661',
    '33551646',
    '37858022',
    '33111095',
    '37149832',
    '95518954',
    '39075674',
    '32222742',
    '37603727',
    '35040334',
    '35776031',
    '37391382',
    '19064608',
    '36434113',
    '33663581',
    '36401516',
    '37758909',
    '32844344',
    '31015224',
    '38751411',
    '36453377',
    '36606817',
    '36275246',
    '35593779',
    '19080483',
    '36669400',
    '32441986',
    '30172939',
    '27431153',
    '34523173',
    '29806100',
    '34661860',
    '38081345',
    '95705156',
    '35219504',
    '34916014',
    '36989837',
    '95668421',
    '35888888',
    '33170660',
    '34299003',
    '33460009',
    '31253730',
    '19033496',
    '32487909',
    '33904534',
    '31885132',
    '35492979',
    '34299226',
    '32529429',
    '32766940',
    '29127770',
    '30055611',
    '34654519',
    '31031717',
    '32750398',
    '31656944',
    '36348029',
    '34969449',
    '21847867',
    '16684507',
    '27214318',
    '31369105',
    '17640853',
    '33870704',
    '24404601',
    '30489443',
    '24883315',
    '22583652',
    '36359698',
    '30057621',
    '29772656',
    '21559220',
    '26999563',
    '26357292',
    '27646245',
    '28776273',
    '32645893',
    '30476749',
    '28624103',
    '32291535',
    '26709336',
    '21626562',
    '22383320',
    '28485493',
    '31549731',
    '29077031',
    '20639304',
    '33387633',
    '29973036',
    '33106597',
    '32313154',
    '20796325',
    '16124994',
    '28423541',
    '28893895',
    '20237400',
    '28454592',
    '30182354',
    '20536878',
    '18829759',
    '29906163',
    '32982660',
    '28135041',
    '24365702',
    '27884169',
    '30035941',
    '20249087',
    '27727768',
    '29973047',
    '13916181',
    '20211155',
    '26589116',
    '33758200',
    '32775156',
    '94673621',
    '33868160',
    '32301147',
    '36423069',
    '36327260',
    '30688632',
    '21378189',
    '34397343',
    '29941636'];


export = run;
