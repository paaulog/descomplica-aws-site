import type { AccessModeType, AccessReason, Actor, PresignedExpiration } from '../s3/access';
import type { CostField, CostPresetName } from '../s3/cost-presets';
import type { KeyError, KeyWarning } from '../s3/key';
import type { S3ObjectPreview } from '../s3/object';
import type {
  AccessFrequency,
  RetentionDays,
  StorageClass,
  StorageClassWarning,
} from '../s3/storage-class';

export const locales = ['pt-br', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-br';

export const htmlLang: Record<Locale, string> = {
  'pt-br': 'pt-BR',
  en: 'en',
};

export const openGraphLocale: Record<Locale, string> = {
  'pt-br': 'pt_BR',
  en: 'en_US',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const ptBr = {
  'site.title': 'Descomplica AWS',
  'site.description':
    'Os serviços principais da AWS explicados de um jeito visual, amigável e prático.',
  'language.name': 'Português',
  'a11y.skipToContent': 'Pular para o conteúdo',
  'header.home': 'Descomplica AWS, página inicial',
  'theme.dark': 'Tema escuro',
  'footer.disclaimer':
    'Projeto independente, sem vínculo com a Amazon Web Services. AWS e os nomes dos serviços são marcas da Amazon.com, Inc. ou de suas afiliadas.',
  'home.eyebrow': 'Documentação interativa',
  'home.title': 'A AWS é menos complicada do que parece.',
  'home.lead':
    'Cada serviço explicado do zero, com analogias do dia a dia e simulações que rodam no seu navegador.',
  'home.servicesHeading': 'Serviços',
  'service.status.soon': 'Em breve',
  'service.cta': 'Começar',
  'nav.sections': 'Seções da página',
  'nav.current': 'Seção atual',
  'section.copyLink': 'Copiar link da seção',
  'section.linkCopied': 'Link copiado',
  'section.block.what': 'O que é',
  'section.block.why': 'Para que serve',
  'section.block.how': 'Como utilizar',
  'section.block.wrap': 'Fechamento',
  'analogy.label': 'Analogia',
  'smallWin.label': 'Pequena vitória',
  'nextHook.label': 'A seguir',
  'summary.label': 'Recapitulando',
  'card.source': 'Fonte',
  'pricing.verified':
    'Preços, limites e nomes de classes conferidos em {date} na documentação oficial da AWS.',
  'pricing.sources': 'Fontes oficiais',
  'nextSteps.heading': 'E agora?',
  'nextSteps.tryIt': 'Criar meu primeiro bucket no console da AWS',
  'nextSteps.nextService': 'Próximo serviço: {service}',
  'nextSteps.soon': 'em breve',
  'nextSteps.author': 'Gostou? Me acompanhe para saber quando o próximo sair:',
  'code.languageLabel': 'Linguagem do exemplo',
  'notFound.title': 'Página não encontrada',
  'notFound.body': 'O endereço que você abriu não existe ou mudou de lugar.',
  'notFound.home': 'Voltar para a página inicial',
} as const;

export type UiKey = keyof typeof ptBr;

const en: Record<UiKey, string> = {
  'site.title': 'Descomplica AWS',
  'site.description': 'The core AWS services explained in a visual, friendly and practical way.',
  'language.name': 'English',
  'a11y.skipToContent': 'Skip to content',
  'header.home': 'Descomplica AWS, home page',
  'theme.dark': 'Dark theme',
  'footer.disclaimer':
    'Independent project, not affiliated with Amazon Web Services. AWS and the service names are trademarks of Amazon.com, Inc. or its affiliates.',
  'home.eyebrow': 'Interactive documentation',
  'home.title': 'AWS is less complicated than it looks.',
  'home.lead':
    'Each service explained from scratch, with everyday analogies and simulations that run in your browser.',
  'home.servicesHeading': 'Services',
  'service.status.soon': 'Coming soon',
  'service.cta': 'Start',
  'nav.sections': 'Page sections',
  'nav.current': 'Current section',
  'section.copyLink': 'Copy link to section',
  'section.linkCopied': 'Link copied',
  'section.block.what': 'What it is',
  'section.block.why': 'What it is for',
  'section.block.how': 'How to use it',
  'section.block.wrap': 'Wrapping up',
  'analogy.label': 'Analogy',
  'smallWin.label': 'Small win',
  'nextHook.label': 'Up next',
  'summary.label': 'Recap',
  'card.source': 'Source',
  'pricing.verified':
    'Prices, limits and class names checked on {date} against the official AWS documentation.',
  'pricing.sources': 'Official sources',
  'nextSteps.heading': 'What now?',
  'nextSteps.tryIt': 'Create my first bucket in the AWS console',
  'nextSteps.nextService': 'Next service: {service}',
  'nextSteps.soon': 'coming soon',
  'nextSteps.author': 'Liked it? Follow me to know when the next one is out:',
  'code.languageLabel': 'Example language',
  'notFound.title': 'Page not found',
  'notFound.body': 'The address you opened does not exist or has moved.',
  'notFound.home': 'Back to the home page',
};

export const ui: Record<Locale, Record<UiKey, string>> = {
  'pt-br': ptBr,
  en,
};

export function createTranslator(locale: Locale): (key: UiKey) => string {
  return (key: UiKey): string => ui[locale][key];
}

export function getOtherLocale(locale: Locale): Locale {
  return locales.find((candidate) => candidate !== locale) ?? defaultLocale;
}

/*
 * Island messages: each island receives only its own slice for one locale through props,
 * so its bundle never carries the other language. `{name}` marks a placeholder.
 */

export const flowSteps = ['user', 'app', 'bucket'] as const;
export type FlowStep = (typeof flowSteps)[number];

export type StorageClassNames = Record<StorageClass, string>;

export interface KeyExplorerMessages {
  title: string;
  fallback: string;
  inputLabel: string;
  examplesLabel: string;
  examples: string[];
  consoleHeading: string;
  bucketLabel: string;
  prefixLabel: string;
  fileLabel: string;
  emptySegment: string;
  noFileName: string;
  byteCount: string;
  flatKey: string;
  errors: Record<KeyError, string>;
  warnings: Record<KeyWarning, string>;
}

export interface UploadToBucketMessages {
  title: string;
  fallback: string;
  bucketName: string;
  defaultPrefix: string;
  sampleFileName: string;
  dropHint: string;
  chooseFile: string;
  useSample: string;
  prefixLabel: string;
  prefixHint: string;
  emptyBucket: string;
  objectAdded: string;
  privacyNote: string;
  fields: Record<keyof S3ObjectPreview, string>;
}

export interface StorageClassSliderMessages {
  title: string;
  fallback: string;
  frequencyLabel: string;
  frequencies: Record<AccessFrequency, string>;
  unknownLabel: string;
  retentionLabel: string;
  retentionOptions: Record<RetentionDays, string>;
  recommendationLabel: string;
  classNames: StorageClassNames;
  classDescriptions: StorageClassNames;
  warnings: Record<StorageClassWarning['type'], string>;
  chartTitle: string;
  chartCaption: string;
  unknownChartNote: string;
  recommendedBadge: string;
  tradeoffNote: string;
  intelligentTieringNote: string;
}

export interface CostCalculatorMessages {
  title: string;
  fallback: string;
  presetsLabel: string;
  presets: Record<CostPresetName, string>;
  inputs: Record<CostField, string>;
  totalLabel: string;
  breakdownTitle: string;
  lines: Record<'storage' | 'requests' | 'transfer', string>;
  freeTransferNote: string;
  freePlanNote: string;
  verifiedNote: string;
}

export interface AccessLockMessages {
  title: string;
  fallback: string;
  modeLabel: string;
  modes: Record<AccessModeType, string>;
  modeHints: Record<AccessModeType, string>;
  actors: Record<Actor, string>;
  allowed: string;
  denied: string;
  reasons: Record<AccessReason, string>;
  expirationLabel: string;
  expirationOptions: Record<PresignedExpiration, string>;
  clockLabel: string;
  advanceHour: string;
  advanceDay: string;
  resetClock: string;
}

export interface VersionTimelineMessages {
  title: string;
  fallback: string;
  objectKey: string;
  versioningOff: string;
  versioningOn: string;
  enableVersioning: string;
  upload: string;
  delete: string;
  restore: string;
  versionLabel: string;
  currentLabel: string;
  deletedForever: string;
  deletedWithMarker: string;
  deleteMarker: string;
  historyHeading: string;
  emptyHistory: string;
}

export interface LifecycleAnimationMessages {
  title: string;
  fallback: string;
  fileName: string;
  dayLabel: string;
  dayValue: string;
  play: string;
  pause: string;
  nextRule: string;
  rulesHeading: string;
  ruleTransition: string;
  ruleExpire: string;
  expired: string;
  currentStatus: string;
  expiredStatus: string;
  classNames: StorageClassNames;
}

export interface FlowDiagramMessages {
  title: string;
  fallback: string;
  steps: Record<FlowStep, { name: string; description: string }>;
  arrows: Record<'upload' | 'store', string>;
}

export interface IslandMessages {
  keyExplorer: KeyExplorerMessages;
  uploadToBucket: UploadToBucketMessages;
  storageClassSlider: StorageClassSliderMessages;
  costCalculator: CostCalculatorMessages;
  accessLock: AccessLockMessages;
  versionTimeline: VersionTimelineMessages;
  lifecycleAnimation: LifecycleAnimationMessages;
  flowDiagram: FlowDiagramMessages;
}

export type IslandName = keyof IslandMessages;

// AWS keeps the product names in English in every language.
const storageClassNames: StorageClassNames = {
  STANDARD: 'S3 Standard',
  INTELLIGENT_TIERING: 'S3 Intelligent-Tiering',
  STANDARD_IA: 'S3 Standard-IA',
  GLACIER_IR: 'S3 Glacier Instant Retrieval',
  GLACIER: 'S3 Glacier Flexible Retrieval',
  DEEP_ARCHIVE: 'S3 Glacier Deep Archive',
};

const islandMessagesPtBr: IslandMessages = {
  keyExplorer: {
    title: 'Simulador de chave',
    fallback:
      'No S3 não existem pastas de verdade. A chave "fotos/2026/praia.jpg" é um texto só; o console usa as barras para desenhar pastas, que na prática são só prefixos da chave.',
    inputLabel: 'Digite uma chave',
    examplesLabel: 'Experimente',
    examples: ['fotos/2026/praia.jpg', 'relatorios/2026/', 'fotos//praia.jpg', '/praia.jpg'],
    consoleHeading: 'Como o console mostra',
    bucketLabel: 'bucket',
    prefixLabel: 'prefixo',
    fileLabel: 'objeto',
    emptySegment: '(vazio)',
    noFileName: 'A chave termina em barra, então o console mostra uma "pasta" vazia.',
    byteCount: '{bytes} de {max} bytes',
    flatKey: 'Para o S3, tudo isso é uma chave só. As "pastas" são prefixos do texto.',
    errors: {
      empty: 'A chave não pode ficar vazia.',
      tooLong: 'A chave passou de {max} bytes em UTF-8, o limite do S3.',
    },
    warnings: {
      leadingSlash: 'Começar com barra funciona, mas cria uma "pasta" sem nome no topo.',
      doubleSlash: 'Duas barras seguidas criam uma "pasta" sem nome no meio do caminho.',
      trailingSlash: 'Terminar com barra é o jeito que o console cria "pastas" vazias.',
    },
  },
  uploadToBucket: {
    title: 'Envie um arquivo para o bucket',
    fallback:
      'Ao enviar um arquivo para o S3, ele vira um objeto dentro do bucket. O objeto ganha uma chave (o nome completo, com o prefixo), um tamanho, um tipo de conteúdo, a data de modificação e um ETag.',
    bucketName: 'meu-bucket-de-exemplo',
    defaultPrefix: 'fotos/',
    sampleFileName: 'praia.jpg',
    dropHint: 'Arraste um arquivo para cá ou use os botões.',
    chooseFile: 'Escolher arquivo',
    useSample: 'Usar arquivo de exemplo',
    prefixLabel: 'Prefixo (opcional)',
    prefixHint: 'Funciona como uma "pasta" na frente do nome.',
    emptyBucket: 'O bucket está vazio. Envie um arquivo para ver ele virar objeto.',
    objectAdded: 'O objeto {key} entrou no bucket.',
    privacyNote:
      'Simulação: o arquivo não sai do seu computador. Só o nome, o tamanho e o tipo são usados.',
    fields: {
      key: 'Chave',
      size: 'Tamanho',
      contentType: 'Tipo de conteúdo',
      lastModified: 'Modificado em',
      etag: 'ETag (fictício)',
    },
  },
  storageClassSlider: {
    title: 'Qual classe de armazenamento usar?',
    fallback:
      'Quanto menos você acessa um arquivo, mais barato fica guardá-lo, mas ler de volta passa a custar mais. Dados usados todo dia vão bem no S3 Standard; backups esquecidos vão para o Glacier. Se você não sabe, o Intelligent-Tiering decide sozinho.',
    frequencyLabel: 'Com que frequência você lê esses dados?',
    frequencies: {
      daily: 'Todo dia',
      weekly: 'Toda semana',
      monthly: 'Uma vez por mês',
      quarterly: 'A cada 3 meses',
      yearly: 'Uma ou duas vezes por ano',
      rarely: 'Quase nunca',
    },
    unknownLabel: 'Não sei com que frequência',
    retentionLabel: 'Por quanto tempo vai guardar?',
    retentionOptions: { '30': '1 mês', '90': '3 meses', '180': '6 meses', '365': '1 ano ou mais' },
    recommendationLabel: 'Classe recomendada',
    classNames: storageClassNames,
    classDescriptions: {
      STANDARD: 'Para dados usados o tempo todo. Leitura em milissegundos e sem taxa para ler.',
      INTELLIGENT_TIERING:
        'Move cada objeto entre níveis de acesso sozinho, conforme o uso. Ótimo quando você não sabe o padrão.',
      STANDARD_IA: 'Para dados lidos pouco, mas que precisam estar prontos na hora.',
      GLACIER_IR: 'Arquivo de longo prazo lido poucas vezes por ano, ainda em milissegundos.',
      GLACIER: 'Arquivo lido uma ou duas vezes por ano. Recuperar leva de minutos a horas.',
      DEEP_ARCHIVE: 'O mais barato de todos, para guardar por anos. Recuperar leva até 12 horas.',
    },
    warnings: {
      minDuration:
        'Cobra no mínimo {days} dias de armazenamento. Apagar antes disso não economiza.',
      retrievalFee: 'Ler os dados de volta custa {price} por GB.',
      slowRetrieval:
        'Os dados precisam ser restaurados antes da leitura, o que leva de minutos a horas.',
    },
    chartTitle: 'Custo por mês no exemplo',
    chartCaption:
      '100 GB em 10 mil objetos, e cada leitura traz os 100 GB de volta. Preços de us-east-1.',
    unknownChartNote:
      'Sem saber a frequência, as barras usam a última posição do controle ({frequency}). Já o Intelligent-Tiering se ajusta sozinho ao uso real.',
    recommendedBadge: 'recomendada',
    tradeoffNote:
      'A mais barata nem sempre é a certa: as classes de arquivo cobram para ler e podem levar horas para devolver os dados.',
    intelligentTieringNote:
      'No Intelligent-Tiering a conta usa o preço do nível frequente, o mais caro, mais a taxa de monitoramento.',
  },
  costCalculator: {
    title: 'Calculadora de custo',
    fallback:
      'O S3 cobra por três coisas: o espaço que você ocupa (GB por mês), as requisições (envios e leituras) e os dados que saem para a internet. Os primeiros 100 GB de saída por mês são grátis.',
    presetsLabel: 'Comece por um exemplo',
    presets: { personalSite: 'Site pessoal', photoApp: 'App de fotos', backup: 'Backup' },
    inputs: {
      storageGb: 'Dados guardados (GB)',
      putRequests: 'Envios por mês (PUT)',
      getRequests: 'Leituras por mês (GET)',
      transferOutGb: 'Saída para a internet (GB por mês)',
    },
    totalLabel: 'Estimativa por mês no S3 Standard',
    breakdownTitle: 'De onde vem o valor',
    lines: { storage: 'Armazenamento', requests: 'Requisições', transfer: 'Transferência' },
    freeTransferNote: 'Os primeiros {gb} GB de saída por mês são grátis.',
    freePlanNote:
      'Conta nova? No Free Plan você ganha {credits} em créditos, mais até {extra}, para usar em até {months} meses.',
    verifiedNote: 'Preços de us-east-1 em dólar, conferidos em {date}.',
  },
  accessLock: {
    title: 'Quem consegue abrir o arquivo?',
    fallback:
      'Todo bucket nasce privado: só quem tem credenciais da conta consegue ler. Você pode deixar um objeto público para qualquer pessoa, ou gerar uma URL pré-assinada, um link que funciona só até a data de expiração.',
    modeLabel: 'Acesso ao objeto',
    modes: { private: 'Privado', public: 'Público', presigned: 'URL pré-assinada' },
    modeHints: {
      private: 'O padrão do S3. Só quem tem credenciais da conta entra.',
      public:
        'Qualquer pessoa com o endereço consegue ler. Para isso, é preciso desligar o Bloqueio de Acesso Público, que vem ligado.',
      presigned: 'Um link assinado que vale por um tempo limitado.',
    },
    actors: {
      owner: 'Você, com as credenciais da conta',
      anonymous: 'Um visitante qualquer',
      linkHolder: 'Quem recebeu o link',
    },
    allowed: 'Consegue ler',
    denied: 'Acesso negado',
    reasons: {
      ownerCredentials:
        'Com credenciais e permissão no IAM, você lê o objeto mesmo com ele privado.',
      privateByDefault: 'O objeto é privado, e um link comum não basta.',
      publicRead: 'O objeto está público para leitura.',
      missingSignature: 'Sem a assinatura do link, o S3 trata o objeto como privado.',
      validSignature: 'A assinatura vale até {time}.',
      expiredSignature: 'O link expirou às {time}.',
    },
    expirationLabel: 'O link expira em',
    expirationOptions: { '900': '15 minutos', '3600': '1 hora', '604800': '7 dias (o máximo)' },
    clockLabel: 'Relógio simulado: {time}',
    advanceHour: 'Avançar 1 hora',
    advanceDay: 'Avançar 1 dia',
    resetClock: 'Voltar ao início',
  },
  versionTimeline: {
    title: 'Linha do tempo de versões',
    fallback:
      'Com o versionamento ligado, o S3 guarda cada versão de um objeto. Apagar não destrói nada: cria um marcador de exclusão, e você pode restaurar uma versão anterior. Sem versionamento, apagar é definitivo.',
    objectKey: 'relatorio.txt',
    versioningOff: 'Versionamento desligado',
    versioningOn: 'Versionamento ligado. Dá para suspender depois, mas não para desligar.',
    enableVersioning: 'Ligar o versionamento',
    upload: 'Enviar nova versão',
    delete: 'Apagar o arquivo',
    restore: 'Restaurar',
    versionLabel: 'Versão {n} do relatório',
    currentLabel: 'Arquivo atual',
    deletedForever: 'Apagado para sempre. Sem versionamento, não tem volta.',
    deletedWithMarker: 'Apagado, mas as versões antigas continuam lá. Dá para restaurar.',
    deleteMarker: 'Marcador de exclusão',
    historyHeading: 'Versões guardadas',
    emptyHistory: 'Nenhuma versão guardada.',
  },
  lifecycleAnimation: {
    title: 'O arquivo envelhece',
    fallback:
      'Regras de ciclo de vida movem os objetos para classes mais baratas com o tempo e podem apagá-los no fim. Por exemplo: depois de 30 dias para o Standard-IA, depois de 90 para o Glacier e, com um ano, apagar.',
    fileName: 'log-de-acesso.txt',
    dayLabel: 'Idade do arquivo',
    dayValue: 'Dia {day}',
    play: 'Ver o tempo passar',
    pause: 'Pausar',
    nextRule: 'Pular para a próxima regra',
    rulesHeading: 'Regras do bucket',
    ruleTransition: 'Depois de {days} dias, mover para {class}',
    ruleExpire: 'Depois de {days} dias, apagar',
    expired: 'Apagado',
    currentStatus: 'No dia {day}, o arquivo está no {class}.',
    expiredStatus: 'No dia {day}, a regra já apagou o arquivo.',
    classNames: storageClassNames,
  },
  flowDiagram: {
    title: 'Onde o S3 entra numa aplicação',
    fallback:
      'O usuário envia a foto para o seu app. O app guarda o arquivo no S3 com uma chamada de API e salva só a chave. Quem guarda, replica e entrega o arquivo é o S3.',
    steps: {
      user: { name: 'Usuário', description: 'Escolhe a foto de perfil no celular.' },
      app: { name: 'Seu app', description: 'Recebe o arquivo e decide a chave.' },
      bucket: { name: 'Bucket no S3', description: 'Guarda o objeto com segurança e escala.' },
    },
    arrows: { upload: 'envia a foto', store: 'PutObject' },
  },
};

const islandMessagesEn: IslandMessages = {
  keyExplorer: {
    title: 'Key simulator',
    fallback:
      'There are no real folders in S3. The key "photos/2026/beach.jpg" is a single string; the console uses the slashes to draw folders, which are really just prefixes of the key.',
    inputLabel: 'Type a key',
    examplesLabel: 'Try',
    examples: ['photos/2026/beach.jpg', 'reports/2026/', 'photos//beach.jpg', '/beach.jpg'],
    consoleHeading: 'How the console shows it',
    bucketLabel: 'bucket',
    prefixLabel: 'prefix',
    fileLabel: 'object',
    emptySegment: '(empty)',
    noFileName: 'The key ends with a slash, so the console shows an empty "folder".',
    byteCount: '{bytes} of {max} bytes',
    flatKey: 'To S3, all of this is a single key. The "folders" are prefixes of the text.',
    errors: {
      empty: 'The key cannot be empty.',
      tooLong: 'The key is over {max} bytes in UTF-8, the S3 limit.',
    },
    warnings: {
      leadingSlash: 'Starting with a slash works, but creates a nameless "folder" at the top.',
      doubleSlash: 'Two slashes in a row create a nameless "folder" in the middle of the path.',
      trailingSlash: 'Ending with a slash is how the console creates empty "folders".',
    },
  },
  uploadToBucket: {
    title: 'Upload a file to the bucket',
    fallback:
      'When you upload a file to S3, it becomes an object inside the bucket. The object gets a key (the full name, with the prefix), a size, a content type, a last modified date and an ETag.',
    bucketName: 'my-example-bucket',
    defaultPrefix: 'photos/',
    sampleFileName: 'beach.jpg',
    dropHint: 'Drag a file here or use the buttons.',
    chooseFile: 'Choose a file',
    useSample: 'Use a sample file',
    prefixLabel: 'Prefix (optional)',
    prefixHint: 'Works like a "folder" in front of the name.',
    emptyBucket: 'The bucket is empty. Upload a file to see it become an object.',
    objectAdded: 'The object {key} is now in the bucket.',
    privacyNote:
      'Simulation: the file never leaves your computer. Only its name, size and type are used.',
    fields: {
      key: 'Key',
      size: 'Size',
      contentType: 'Content type',
      lastModified: 'Last modified',
      etag: 'ETag (fictitious)',
    },
  },
  storageClassSlider: {
    title: 'Which storage class should you use?',
    fallback:
      'The less often you access a file, the cheaper it is to store, but reading it back starts to cost more. Data used every day fits S3 Standard; forgotten backups go to Glacier. If you are not sure, Intelligent-Tiering decides for you.',
    frequencyLabel: 'How often do you read this data?',
    frequencies: {
      daily: 'Every day',
      weekly: 'Every week',
      monthly: 'Once a month',
      quarterly: 'Every 3 months',
      yearly: 'Once or twice a year',
      rarely: 'Almost never',
    },
    unknownLabel: 'I do not know how often',
    retentionLabel: 'How long will you keep it?',
    retentionOptions: {
      '30': '1 month',
      '90': '3 months',
      '180': '6 months',
      '365': '1 year or more',
    },
    recommendationLabel: 'Recommended class',
    classNames: storageClassNames,
    classDescriptions: {
      STANDARD: 'For data used all the time. Millisecond reads and no fee to read.',
      INTELLIGENT_TIERING:
        'Moves each object between access tiers on its own, based on usage. Great when you do not know the pattern.',
      STANDARD_IA: 'For data read rarely that still has to be ready right away.',
      GLACIER_IR: 'Long-term archive read a few times a year, still in milliseconds.',
      GLACIER: 'Archive read once or twice a year. Retrieval takes minutes to hours.',
      DEEP_ARCHIVE:
        'The cheapest of all, for keeping data for years. Retrieval takes up to 12 hours.',
    },
    warnings: {
      minDuration: 'Charges at least {days} days of storage. Deleting earlier saves nothing.',
      retrievalFee: 'Reading the data back costs {price} per GB.',
      slowRetrieval: 'The data must be restored before reading, which takes minutes to hours.',
    },
    chartTitle: 'Monthly cost in the example',
    chartCaption:
      '100 GB in 10,000 objects, and each read brings all 100 GB back. us-east-1 prices.',
    unknownChartNote:
      'Without a known frequency, the bars use the last position of the control ({frequency}). Intelligent-Tiering adjusts to the real usage on its own.',
    recommendedBadge: 'recommended',
    tradeoffNote:
      'The cheapest is not always the right one: archive classes charge to read and can take hours to return the data.',
    intelligentTieringNote:
      'For Intelligent-Tiering the estimate uses the frequent tier price, the highest one, plus the monitoring fee.',
  },
  costCalculator: {
    title: 'Cost calculator',
    fallback:
      'S3 charges for three things: the space you use (GB per month), the requests (uploads and reads) and the data sent out to the internet. The first 100 GB out each month are free.',
    presetsLabel: 'Start from an example',
    presets: { personalSite: 'Personal site', photoApp: 'Photo app', backup: 'Backup' },
    inputs: {
      storageGb: 'Data stored (GB)',
      putRequests: 'Uploads per month (PUT)',
      getRequests: 'Reads per month (GET)',
      transferOutGb: 'Data out to the internet (GB per month)',
    },
    totalLabel: 'Monthly estimate on S3 Standard',
    breakdownTitle: 'Where the amount comes from',
    lines: { storage: 'Storage', requests: 'Requests', transfer: 'Data transfer' },
    freeTransferNote: 'The first {gb} GB out each month are free.',
    freePlanNote:
      'New account? On the Free Plan you get {credits} in credits, plus up to {extra}, to use within {months} months.',
    verifiedNote: 'us-east-1 prices in US dollars, checked on {date}.',
  },
  accessLock: {
    title: 'Who can open the file?',
    fallback:
      'Every bucket starts private: only someone with the account credentials can read. You can make an object public for anyone, or create a presigned URL, a link that works only until it expires.',
    modeLabel: 'Object access',
    modes: { private: 'Private', public: 'Public', presigned: 'Presigned URL' },
    modeHints: {
      private: 'The S3 default. Only someone with the account credentials gets in.',
      public:
        'Anyone with the address can read it. That requires turning off Block Public Access, which starts on.',
      presigned: 'A signed link that is valid for a limited time.',
    },
    actors: {
      owner: 'You, with the account credentials',
      anonymous: 'A random visitor',
      linkHolder: 'Whoever got the link',
    },
    allowed: 'Can read',
    denied: 'Access denied',
    reasons: {
      ownerCredentials:
        'With credentials and IAM permission, you can read the object even while it is private.',
      privateByDefault: 'The object is private, and a plain link is not enough.',
      publicRead: 'The object is public for reading.',
      missingSignature: 'Without the link signature, S3 treats the object as private.',
      validSignature: 'The signature is valid until {time}.',
      expiredSignature: 'The link expired at {time}.',
    },
    expirationLabel: 'The link expires in',
    expirationOptions: { '900': '15 minutes', '3600': '1 hour', '604800': '7 days (the maximum)' },
    clockLabel: 'Simulated clock: {time}',
    advanceHour: 'Move 1 hour ahead',
    advanceDay: 'Move 1 day ahead',
    resetClock: 'Back to the start',
  },
  versionTimeline: {
    title: 'Version timeline',
    fallback:
      'With versioning on, S3 keeps every version of an object. Deleting destroys nothing: it adds a delete marker, and you can restore an older version. Without versioning, deleting is final.',
    objectKey: 'report.txt',
    versioningOff: 'Versioning off',
    versioningOn: 'Versioning on. You can suspend it later, but not turn it off.',
    enableVersioning: 'Turn on versioning',
    upload: 'Upload a new version',
    delete: 'Delete the file',
    restore: 'Restore',
    versionLabel: 'Report version {n}',
    currentLabel: 'Current file',
    deletedForever: 'Deleted for good. Without versioning, there is no way back.',
    deletedWithMarker: 'Deleted, but the old versions are still there. You can restore one.',
    deleteMarker: 'Delete marker',
    historyHeading: 'Stored versions',
    emptyHistory: 'No stored versions.',
  },
  lifecycleAnimation: {
    title: 'The file gets older',
    fallback:
      'Lifecycle rules move objects to cheaper classes over time and can delete them at the end. For example: after 30 days to Standard-IA, after 90 to Glacier and, at one year, delete.',
    fileName: 'access-log.txt',
    dayLabel: 'File age',
    dayValue: 'Day {day}',
    play: 'Watch time go by',
    pause: 'Pause',
    nextRule: 'Jump to the next rule',
    rulesHeading: 'Bucket rules',
    ruleTransition: 'After {days} days, move to {class}',
    ruleExpire: 'After {days} days, delete',
    expired: 'Deleted',
    currentStatus: 'On day {day}, the file is in {class}.',
    expiredStatus: 'On day {day}, the rule has already deleted the file.',
    classNames: storageClassNames,
  },
  flowDiagram: {
    title: 'Where S3 fits in an application',
    fallback:
      'The user sends the photo to your app. The app stores the file in S3 with an API call and saves only the key. S3 is what stores, replicates and serves the file.',
    steps: {
      user: { name: 'User', description: 'Picks a profile photo on the phone.' },
      app: { name: 'Your app', description: 'Receives the file and decides the key.' },
      bucket: { name: 'S3 bucket', description: 'Stores the object safely and at scale.' },
    },
    arrows: { upload: 'sends the photo', store: 'PutObject' },
  },
};

export const islandMessages: Record<Locale, IslandMessages> = {
  'pt-br': islandMessagesPtBr,
  en: islandMessagesEn,
};

export function getIslandMessages<N extends IslandName>(
  locale: Locale,
  name: N,
): IslandMessages[N] {
  return islandMessages[locale][name];
}
