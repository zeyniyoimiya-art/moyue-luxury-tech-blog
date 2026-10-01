// Pergamino II — Personajes clave (人物)
import type { Article, Person } from "../types";
import { IMG } from "../images";

const antiguos: Person[] = [
  {
    name: "Cai Lun", zh: "蔡伦", era: "c. 50/62 – 121 d.C. · Han Orientales", role: "Funcionario imperial, perfeccionador del papel", glyph: "纸",
    bio: "Eunuco de la corte Han, dirigió los talleres imperiales de armas e instrumentos. En el año 105 presentó al emperador He un método para fabricar papel con corteza de morera, cáñamo, trapos y redes. Fue nombrado marqués de Longting en 114. Envuelto en intrigas palaciegas, se quitó la vida en el año 121.",
    achievements: ["Estandarizó la fabricación de papel (105 d.C.)", "Usó materiales baratos y reciclados", "Figura en la lista de «Los 100» de Michael H. Hart, en el puesto 7"],
  },
  {
    name: "Bi Sheng", zh: "毕昇", era: "c. 990 – 1051 · Song del Norte", role: "Artesano, inventor del tipo móvil", glyph: "印",
    bio: "Plebeyo del que apenas sabemos nada: su invento sobrevivió gracias a la descripción de Shen Kuo. Entre 1039 y 1048 creó tipos móviles de arcilla cocida, fijados con resina y cera sobre una placa de hierro, que podían reordenarse para imprimir distintos textos.",
    achievements: ["Primer sistema documentado de tipos móviles (c. 1040)", "Separó carácter y página: la idea de la composición modular", "Precedió en ~400 años a Gutenberg"],
  },
  {
    name: "Zhang Heng", zh: "张衡", era: "78 – 139 · Han Orientales", role: "Astrónomo, matemático, ingeniero y poeta", glyph: "震",
    bio: "Astrónomo jefe de la corte Han. En 132 construyó el primer sismoscopio de la historia (候风地动仪): una vasija de bronce con ocho dragones que dejaban caer una bola en la boca de un sapo, indicando la dirección de un terremoto lejano. Fue también un poeta celebrado.",
    achievements: ["Sismoscopio (132 d.C.)", "Esfera armilar accionada por agua", "Catálogo estelar de unas 2.500 estrellas", "Un cráter lunar y el asteroide 1802 llevan su nombre"],
  },
  {
    name: "Shen Kuo", zh: "沈括", era: "1031 – 1095 · Song del Norte", role: "Polímata, estadista y científico", glyph: "梦",
    bio: "Funcionario, diplomático y general, escribió hacia 1088 los «Ensayos del Estanque de los Sueños» (梦溪笔谈), una enciclopedia de observaciones sobre astronomía, geología, medicina, matemáticas e ingeniería. Allí describió la aguja magnética y la imprenta de Bi Sheng.",
    achievements: ["Primera descripción de la declinación magnética", "Teorizó la formación geológica por sedimentación", "Dedujo cambios climáticos a partir de bambú fósil", "Acuñó la palabra 石油 (shíyóu, «petróleo»)"],
  },
  {
    name: "Zu Chongzhi", zh: "祖冲之", era: "429 – 500 · Dinastías del Sur", role: "Matemático y astrónomo", glyph: "π",
    bio: "Calculó que π está entre 3,1415926 y 3,1415927: un récord de precisión que se mantuvo unos 900 años, hasta al-Kashi (1424). Propuso la fracción 355/113 (密率, «razón precisa») y elaboró el calendario Daming, que incorporaba la precesión de los equinoccios.",
    achievements: ["π con 7 decimales correctos", "Fracción 355/113", "Calendario Daming (462)", "Un cráter lunar lleva su nombre"],
  },
];

const modernos: Person[] = [
  {
    name: "Ren Zhengfei", zh: "任正非", era: "n. 1944 · Guizhou", role: "Fundador de Huawei", glyph: "华",
    bio: "Ingeniero del cuerpo de ingenieros del Ejército Popular de Liberación, fundó Huawei en Shenzhen en 1987 con un capital de 21.000 yuanes, revendiendo centralitas telefónicas. Bajo su liderazgo la empresa se convirtió en el mayor fabricante mundial de equipos de telecomunicaciones.",
    achievements: ["Fundó Huawei (1987)", "Modelo de propiedad de los empleados", "Inversión en I+D superior al 20% de los ingresos en los últimos años"],
    quote: { text: "Durante diez años he pensado cada día en el fracaso, sin prestar atención al éxito.", source: "Ensayo «El invierno de Huawei» (2001)" },
  },
  {
    name: "Liang Wenfeng", zh: "梁文锋", era: "n. 1985 · Zhanjiang, Guangdong", role: "Fundador de DeepSeek", glyph: "深",
    bio: "Ingeniero formado en la Universidad de Zhejiang. Cofundó en 2015 el fondo cuantitativo High-Flyer (幻方) y en julio de 2023 fundó DeepSeek en Hangzhou. Sus modelos DeepSeek-V3 (dic. 2024) y R1 (ene. 2025), de pesos abiertos, sacudieron la industria por su eficiencia.",
    achievements: ["DeepSeek-R1, n.º 1 en la App Store de EE. UU. (enero 2025)", "Licencia abierta MIT para R1", "Demostró entrenamiento eficiente a gran escala"],
    quote: { text: "Creemos que, a medida que la economía se desarrolla, China debe convertirse gradualmente en contribuyente en lugar de aprovecharse siempre del trabajo ajeno.", source: "Entrevista con 暗涌 Waves (2024)" },
  },
  {
    name: "Wang Chuanfu", zh: "王传福", era: "n. 1966 · Anhui", role: "Fundador de BYD", glyph: "电",
    bio: "Químico especializado en metalurgia, fundó BYD en Shenzhen en 1995 fabricando baterías recargables para teléfonos móviles. En 2003 entró en el automóvil y en 2008 Berkshire Hathaway, de Warren Buffett, adquirió cerca del 10% de la empresa. En 2022 BYD dejó de fabricar coches solo de combustión.",
    achievements: ["De baterías a líder mundial de vehículos electrificados", "Batería Blade (2020)", "Más de 4,2 millones de vehículos vendidos en 2024"],
    quote: { text: "La tecnología es el rey; la innovación, el fundamento.", source: "Filosofía corporativa de BYD (技术为王，创新为本)" },
  },
  {
    name: "Frank Wang (Wang Tao)", zh: "汪滔", era: "n. 1980 · Hangzhou", role: "Fundador de DJI", glyph: "翔",
    bio: "Apasionado de los helicópteros de radiocontrol desde niño, estudió en la Universidad de Ciencia y Tecnología de Hong Kong (HKUST), donde desarrolló un controlador de vuelo. En 2006 fundó DJI en Shenzhen; el Phantom (2013) popularizó el dron de consumo en todo el mundo.",
    achievements: ["Fundó DJI (2006)", "Phantom (2013), icono del dron de consumo", "DJI domina la mayor parte del mercado mundial de drones civiles"],
    quote: { text: "The Future of Possible — el futuro de lo posible.", source: "Lema de DJI" },
  },
  {
    name: "Ma Huateng (Pony Ma)", zh: "马化腾", era: "n. 1971 · Shantou, Guangdong", role: "Cofundador de Tencent", glyph: "腾",
    bio: "Graduado en informática por la Universidad de Shenzhen (1993), cofundó Tencent en noviembre de 1998 con cuatro compañeros. Su mensajería QQ (1999) y, sobre todo, WeChat (2011) se convirtieron en la infraestructura digital cotidiana de más de mil millones de personas.",
    achievements: ["QQ (1999) y WeChat (2011)", "Tencent, una de las mayores compañías de videojuegos del mundo", "Impulsó el concepto «Internet Plus» (互联网+) en 2015"],
  },
];

export const personajes: Article = {
  slug: "personajes",
  title: "Personajes clave",
  zh: "人物",
  zhMeaning: "rénwù · «personajes, figuras»",
  subtitle: "De Cai Lun a Liang Wenfeng: diez mentes que unen dos mil años de ingenio.",
  excerpt: "Eunucos de la corte Han, astrónomos-poetas, polímatas Song y fundadores de Shenzhen y Hangzhou: biografías, logros y frases de los nombres que escribieron la historia tecnológica de China.",
  date: "2025-02-09",
  readMin: 13,
  hero: IMG.calligraphy,
  blocks: [
    { t: "p", drop: "人", text: "La historia de la tecnología suele contarse como una sucesión de objetos; en este pergamino la contamos como una sucesión de **personas**. Algunos nombres nos han llegado gracias a un solo párrafo escrito por otro —como Bi Sheng, salvado del olvido por Shen Kuo—; otros ocupan hoy portadas de revistas financieras. Entre ambos extremos hay un hilo común: la paciencia del artesano, la obsesión del erudito y la audacia de quien apuesta por lo que aún no existe." },
    { t: "p", text: "La selección es necesariamente incompleta. Faltan Ma Jun y su carro que señala el sur, Su Song y su torre astronómica de relojería (1092), Song Yingxing y su enciclopedia técnica *Tiangong Kaiwu* (1637), o la científica **Tu Youyou**, Nobel de Medicina en 2015 por la artemisinina, inspirada en un texto médico del siglo IV. Pero los diez elegidos dibujan bien el arco que va de la tinta al silicio." },
    { t: "quote", cn: "工欲善其事必先利其器", text: "El artesano que quiere hacer bien su trabajo debe primero afilar sus herramientas.", author: "Confucio, Analectas XV.10", translation: "afilar la herramienta antes de la obra" },
    { t: "h2", text: "Los antiguos: eruditos del pincel y la estrella", zh: "古" },
    { t: "p", text: "Los cinco primeros vivieron entre los siglos I y XI. Ninguno se habría definido como «inventor» en el sentido moderno: eran funcionarios, astrónomos de corte, artesanos o letrados al servicio del Estado. Su ciencia estaba ligada al calendario, al ritual, a la administración y a la guerra. Y, sin embargo, muchas de sus intuiciones se adelantaron siglos a Europa." },
    { t: "portraits", people: antiguos },
    { t: "note", text: "La aproximación **355/113** de Zu Chongzhi es exacta hasta el sexto decimal (3,14159292…). En Europa no se redescubrió hasta el siglo XVI, por obra del neerlandés Adriaan Anthonisz. En China se la conoce como **祖率** (zǔlǜ), «la razón de Zu»." },
    { t: "p", text: "Merece la pena detenerse en **Shen Kuo**, quizá el espíritu más moderno de la lista. En sus *Ensayos del Estanque de los Sueños* observó conchas fósiles en acantilados lejos del mar y dedujo que esas tierras habían sido antiguo lecho marino; encontró bambú petrificado en Yan'an, una región demasiado seca para el bambú, y concluyó que el clima había cambiado. También describió la cámara oscura, mejoró instrumentos astronómicos y documentó el uso de un líquido inflamable al que llamó **石油** («aceite de roca»), palabra que todavía hoy significa petróleo en chino." },
    { t: "divider", label: "今 · hoy" },
    { t: "h2", text: "Los modernos: fundadores de la era digital", zh: "今" },
    { t: "p", text: "El salto de mil años no es tan abrupto como parece. Los cinco fundadores modernos comparten con los antiguos una relación estrecha con el Estado y con la ingeniería aplicada, pero operan en mercados globales. Tres de ellos (Ren Zhengfei, Wang Chuanfu, Frank Wang) construyeron sus empresas en **Shenzhen**; uno (Ma Huateng) también; y el más joven, Liang Wenfeng, en **Hangzhou**, la antigua capital de los Song del Sur. Todos empezaron con productos modestos: centralitas revendidas, baterías para móviles, controladores de vuelo de laboratorio, un clon de ICQ, un fondo de inversión cuantitativo." },
    { t: "portraits", people: modernos },
    { t: "h3", text: "Patrones comunes" },
    { t: "p", text: "Si algo une a estos fundadores es la **integración vertical**: Huawei diseña sus propios chips (HiSilicon) y su sistema operativo (HarmonyOS); BYD fabrica sus baterías, motores y semiconductores; DJI controla del sensor al software. Es una estrategia nacida de la necesidad —cadenas de suministro frágiles, sanciones, competencia feroz— que recuerda a los talleres imperiales que Cai Lun dirigía: producir dentro todo lo que importa." },
    { t: "table", caption: "Fundadores modernos comparados", head: ["Fundador", "Empresa", "Año", "Ciudad", "Primer producto"], rows: [
      ["Ren Zhengfei 任正非", "Huawei", "1987", "Shenzhen", "Reventa de centralitas telefónicas (PBX)"],
      ["Wang Chuanfu 王传福", "BYD", "1995", "Shenzhen", "Baterías recargables de níquel"],
      ["Ma Huateng 马化腾", "Tencent", "1998", "Shenzhen", "OICQ / QQ (mensajería)"],
      ["Frank Wang 汪滔", "DJI", "2006", "Shenzhen", "Controladores de vuelo"],
      ["Liang Wenfeng 梁文锋", "DeepSeek", "2023", "Hangzhou", "Modelos de lenguaje abiertos"],
    ] },
    { t: "p", text: "Hay también diferencias profundas. Ren Zhengfei ha cultivado una imagen casi ascética, con discursos internos sobre el «invierno» y la supervivencia. Liang Wenfeng es célebre por su discreción: apenas concede entrevistas y ha defendido que su equipo esté formado sobre todo por jóvenes graduados de universidades chinas, en lugar de fichajes internacionales. Ma Huateng es conocido como un gestor reservado, más cercano al producto que a la tribuna." },
    { t: "quote", cn: "冬天", text: "El invierno llegará; debemos prepararnos para él mientras aún brilla el sol.", author: "Idea central de «El invierno de Huawei», Ren Zhengfei (2001)", translation: "invierno" },
    { t: "p", text: "De Cai Lun a Liang Wenfeng, la lección es la misma: las tecnologías que perduran no son las más espectaculares, sino las que se vuelven **infraestructura** —tan cotidianas como una hoja de papel o un mensaje de WeChat—. El verdadero triunfo de un invento es volverse invisible." },
    { t: "sources", items: [
      { label: "Britannica — Zhang Heng", url: "https://www.britannica.com/biography/Zhang-Heng" },
      { label: "Britannica — Shen Kuo", url: "https://www.britannica.com/biography/Shen-Kuo" },
      { label: "Britannica — Zu Chongzhi", url: "https://www.britannica.com/biography/Zu-Chongzhi" },
      { label: "Wikipedia — Ren Zhengfei", url: "https://en.wikipedia.org/wiki/Ren_Zhengfei" },
      { label: "Wikipedia — Liang Wenfeng", url: "https://en.wikipedia.org/wiki/Liang_Wenfeng" },
      { label: "Wikipedia — Wang Chuanfu", url: "https://en.wikipedia.org/wiki/Wang_Chuanfu" },
      { label: "Wikipedia — Frank Wang", url: "https://en.wikipedia.org/wiki/Frank_Wang" },
      { label: "Wikipedia — Ma Huateng", url: "https://en.wikipedia.org/wiki/Ma_Huateng" },
    ] },
  ],
};
