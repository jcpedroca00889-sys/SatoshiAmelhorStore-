import type { DeliveryContent } from "./orders";

/**
 * Banco de dados de entregas automáticas para produtos digitais.
 * Cada produto digital tem um conjunto de contas/códigos/assinaturas
 * que são liberados automaticamente quando o pagamento é aprovado.
 */

interface DigitalProductContent {
  productId: string;
  type: "account" | "license" | "subscription" | "voucher" | "access";
  label: string;
  items: DeliveryContent[][]; // múltiplos lotes de entrega (um por unidade comprada)
}

const DIGITAL_DELIVERIES: DigitalProductContent[] = [
  // ─── Plataformas de Streaming ───
  {
    productId: "netflix-premium-4k",
    type: "subscription",
    label: "Netflix Premium 4K",
    items: [
      [
        { label: "Email de Acesso", value: "netflix.4k.user4512@tempmail.net" },
        { label: "Senha", value: "N3tfl!x#4K@2026" },
        { label: "Tipo de Plano", value: "Premium - 4K HDR" },
        { label: "Telas Simultâneas", value: "4 telas" },
        { label: "Data de Expiração", value: "15/07/2027" },
        { label: "Instruções", value: "Faça login em netflix.com/br/login. Não altere email/senha." },
      ],
      [
        { label: "Email de Acesso", value: "netflix.4k.user7831@tempmail.net" },
        { label: "Senha", value: "Str0ng!N3tfl!x" },
        { label: "Tipo de Plano", value: "Premium - 4K HDR" },
        { label: "Telas Simultâneas", value: "4 telas" },
        { label: "Data de Expiração", value: "20/08/2027" },
        { label: "Instruções", value: "Recomendado usar VPN se estiver fora do Brasil." },
      ],
    ],
  },
  {
    productId: "youtube-premium-1m",
    type: "subscription",
    label: "YouTube Premium",
    items: [
      [
        { label: "Email de Acesso", value: "yt.premium5521@tempmail.net" },
        { label: "Senha", value: "YTPr3m!um#2026" },
        { label: "Plano", value: "Premium Individual" },
        { label: "Válido até", value: "30/08/2027" },
        { label: "Instruções", value: "Login em youtube.com/account. Inclui YouTube Music." },
      ],
      [
        { label: "Email de Acesso", value: "yt.premium8893@tempmail.net" },
        { label: "Senha", value: "YouTub3#Pr3m!um" },
        { label: "Plano", value: "Premium Individual" },
        { label: "Válido até", value: "15/09/2027" },
        { label: "Instruções", value: "Não compartilhe a senha. Ative o background play." },
      ],
    ],
  },
  {
    productId: "disney-plus-premium",
    type: "subscription",
    label: "Disney+ Premium",
    items: [
      [
        { label: "Email de Acesso", value: "disney.premium3321@tempmail.net" },
        { label: "Senha", value: "Mick3y#2026@Br" },
        { label: "Plano", value: "Premium Mensal - 4K HDR" },
        { label: "Válido até", value: "10/08/2027" },
        { label: "Perfis", value: "5 perfis disponíveis" },
        { label: "Instruções", value: "Login em disneyplus.com/pt-br." },
      ],
      [
        { label: "Email de Acesso", value: "disney.premium7745@tempmail.net" },
        { label: "Senha", value: "D!zn3y#Str3@m" },
        { label: "Plano", value: "Premium Mensal - 4K HDR" },
        { label: "Válido até", value: "05/09/2027" },
        { label: "Instruções", value: "Inclui Star+. Não compartilhe a senha." },
      ],
    ],
  },
  {
    productId: "hbo-max-premium",
    type: "subscription",
    label: "HBO Max Premium",
    items: [
      [
        { label: "Email de Acesso", value: "hbomax.premium2213@tempmail.net" },
        { label: "Senha", value: "HBO#M4x@2026" },
        { label: "Plano", value: "Premium - Full HD" },
        { label: "Válido até", value: "22/09/2027" },
        { label: "Perfis", value: "3 perfis" },
        { label: "Instruções", value: "Login em hbomax.com/br." },
      ],
    ],
  },
  {
    productId: "prime-video-premium",
    type: "subscription",
    label: "Amazon Prime Video",
    items: [
      [
        { label: "Email de Acesso", value: "prime.user6621@tempmail.net" },
        { label: "Senha", value: "Amaz0n#Pr!me@26" },
        { label: "Plano", value: "Prime Video Mensal" },
        { label: "Benefícios", value: "Prime Video, Prime Music, Frete Grátis" },
        { label: "Válido até", value: "18/10/2027" },
        { label: "Instruções", value: "Login em amazon.com.br." },
      ],
    ],
  },
  {
    productId: "netflix-premium-ultra",
    type: "subscription",
    label: "Conta Netflix Premium Ultra",
    items: [
      [
        { label: "Email de Acesso", value: "netflix.user7843@tempmail.net" },
        { label: "Senha", value: "Str0ng!Netflix#2026" },
        { label: "Tipo de Plano", value: "Premium Ultra - 4K HDR" },
        { label: "Telas Simultâneas", value: "4 telas" },
        { label: "Data de Expiração", value: "30/06/2027" },
        { label: "Perfil", value: "Perfil principal: SATOSHI" },
        { label: "Instruções", value: "Faça login em netflix.com/br/login. Não altere email/senha." },
      ],
      [
        { label: "Email de Acesso", value: "netflix.user8912@tempmail.net" },
        { label: "Senha", value: "Netflix@2026#Gold" },
        { label: "Tipo de Plano", value: "Premium Ultra - 4K HDR" },
        { label: "Telas Simultâneas", value: "4 telas" },
        { label: "Data de Expiração", value: "30/07/2027" },
        { label: "Perfil", value: "Perfil principal: SATOSHI_02" },
        { label: "Instruções", value: "Recomendado usar VPN se estiver fora do Brasil." },
      ],
    ],
  },
  {
    productId: "spotify-family-2026",
    type: "subscription",
    label: "Assinatura Spotify Family",
    items: [
      [
        { label: "Email de Acesso", value: "spotify.family8923@tempmail.net" },
        { label: "Senha", value: "Music#Family$2026" },
        { label: "Plano", value: "Family - 6 contas" },
        { label: "Válido até", value: "15/08/2027" },
        { label: "Convites", value: "6 links de convite disponíveis no painel" },
        { label: "Instruções", value: "Acesse spotify.com/br/account e faça login. Não mude o plano." },
      ],
      [
        { label: "Email de Acesso", value: "spotify.family4512@tempmail.net" },
        { label: "Senha", value: "Fam1ly$pot!fy" },
        { label: "Plano", value: "Family - 6 contas" },
        { label: "Válido até", value: "20/09/2027" },
        { label: "Instruções", value: "Entre em contato se precisar de ajuda para configurar perfis." },
      ],
    ],
  },
  {
    productId: "disney-plus-annual",
    type: "subscription",
    label: "Disney+ Anual Premium",
    items: [
      [
        { label: "Email de Acesso", value: "disney.premium5567@tempmail.net" },
        { label: "Senha", value: "Mickey@2026#Br" },
        { label: "Plano", value: "Premium Anual - 4K HDR" },
        { label: "Válido até", value: "10/12/2026" },
        { label: "Perfis", value: "5 perfis disponíveis" },
        { label: "Instruções", value: "Login em disneyplus.com/pt-br. Não compartilhe a senha principal." },
      ],
      [
        { label: "Email de Acesso", value: "disney.premium9034@tempmail.net" },
        { label: "Senha", value: "D!sney@2026Star" },
        { label: "Plano", value: "Premium Anual - 4K HDR" },
        { label: "Válido até", value: "05/01/2027" },
        { label: "Instruções", value: "Inclui Star+ e conteúdo adulto. Aproveite!" },
      ],
    ],
  },
  {
    productId: "hbo-max-ultra",
    type: "subscription",
    label: "HBO Max Ultra",
    items: [
      [
        { label: "Email de Acesso", value: "hbomax.user3341@tempmail.net" },
        { label: "Senha", value: "G0T#HBO@2026" },
        { label: "Plano", value: "Ultra - 4K HDR" },
        { label: "Válido até", value: "22/10/2026" },
        { label: "Perfis", value: "5 perfis" },
        { label: "Instruções", value: "Faça login em hbomax.com/br. Senha case-sensitive." },
      ],
    ],
  },
  // ─── Cursos e Assinaturas ───
  {
    productId: "curso-fullstack-master",
    type: "access",
    label: "Curso FullStack Master",
    items: [
      [
        { label: "Plataforma", value: "Hotmart" },
        { label: "Email de Acesso", value: "aluno.fullstack4721@gmail.com" },
        { label: "Senha de Acesso", value: "FullStack@2026" },
        { label: "Link do Curso", value: "https://hotmart.com/meus-cursos/fullstack-master-2026" },
        { label: "Código de Ativação", value: "FSM-8X2K-4P9Q-M7NR" },
        { label: "Suporte", value: "suporte@fullstackmaster.com (48h úteis)" },
        { label: "Bônus", value: "E-book 'Arquitetura Limpa na Prática' liberado" },
        { label: "Validade", value: "Acesso vitalício" },
      ],
      [
        { label: "Plataforma", value: "Hotmart" },
        { label: "Email de Acesso", value: "aluno.fullstack8934@gmail.com" },
        { label: "Senha de Acesso", value: "M4ster#Full$tack" },
        { label: "Link do Curso", value: "https://hotmart.com/meus-cursos/fullstack-master-2026" },
        { label: "Código de Ativação", value: "FSM-7Y3L-5Q8R-N2PT" },
        { label: "Validade", value: "Acesso vitalício" },
      ],
    ],
  },
  {
    productId: "curso-ingles-fluente",
    type: "access",
    label: "Curso Inglês Fluente em 6 Meses",
    items: [
      [
        { label: "Plataforma", value: "Kiwify" },
        { label: "Email de Acesso", value: "student.english7723@tempmail.net" },
        { label: "Senha", value: "Engl1sh#Fluent!" },
        { label: "Link de Acesso", value: "https://kiwify.com/meus-cursos/ingles-fluente-6m" },
        { label: "Código de Ativação", value: "ENG-4X7K-2P9M" },
        { label: "Material Extra", value: "PDF + Áudios MP3 + Flashcards liberados" },
        { label: "Validade", value: "Acesso vitalício" },
      ],
    ],
  },
  {
    productId: "assinatura-design-premium",
    type: "subscription",
    label: "Design Premium PRO",
    items: [
      [
        { label: "Email de Acesso", value: "designer.pro5542@tempmail.net" },
        { label: "Senha", value: "D3sign#PRO@2026" },
        { label: "Plano", value: "PRO - Todos os recursos" },
        { label: "Válido até", value: "12/11/2026" },
        { label: "Recursos", value: "50GB Cloud, Templates Premium, Fontes Exclusivas" },
        { label: "Instruções", value: "Login em designpremium.com.br. Ative seu perfil profissional." },
      ],
    ],
  },
  {
    productId: "cloud-storage-1tb",
    type: "account",
    label: "Cloud Storage 1TB",
    items: [
      [
        { label: "Email de Acesso", value: "cloud.user6612@tempmail.net" },
        { label: "Senha", value: "Cl0ud#1TB@2026" },
        { label: "Espaço", value: "1 TB (1000 GB)" },
        { label: "Compartilhamento", value: "Até 20 usuários" },
        { label: "Válido até", value: "08/08/2027" },
        { label: "Instruções", value: "Faça login em cloudstorage.com.br. Recomendado ativar 2FA." },
      ],
    ],
  },

  // ─── Assinaturas de Produtividade ───
  {
    productId: "chatgpt-plus-1m",
    type: "subscription",
    label: "ChatGPT Plus",
    items: [
      [
        { label: "Email de Acesso", value: "chatgpt.user4512@tempmail.net" },
        { label: "Senha", value: "GPT#Plu5@2026" },
        { label: "Plano", value: "Plus - GPT-4 ilimitado" },
        { label: "Válido até", value: "30/09/2027" },
        { label: "Recursos", value: "GPT-4, DALL-E 3, Plugins, Navegação Web" },
        { label: "Instruções", value: "Login em chat.openai.com. Não compartilhe a conta." },
      ],
      [
        { label: "Email de Acesso", value: "chatgpt.user7834@tempmail.net" },
        { label: "Senha", value: "Ch4tGPT#Plus!" },
        { label: "Plano", value: "Plus - GPT-4 ilimitado" },
        { label: "Válido até", value: "15/10/2027" },
        { label: "Instruções", value: "Troque a senha após o primeiro acesso." },
      ],
    ],
  },
  {
    productId: "notion-plus-1m",
    type: "subscription",
    label: "Notion Plus",
    items: [
      [
        { label: "Email de Acesso", value: "notion.user3321@tempmail.net" },
        { label: "Senha", value: "N0t!on#Plus@26" },
        { label: "Plano", value: "Plus - Upload Ilimitado" },
        { label: "Válido até", value: "20/10/2027" },
        { label: "Recursos", value: "Upload ilimitado, Convidados ilimitados, Histórico 30 dias" },
        { label: "Instruções", value: "Login em notion.so. Aceite o convite no email." },
      ],
    ],
  },
  {
    productId: "midjourney-1m",
    type: "subscription",
    label: "Midjourney Premium",
    items: [
      [
        { label: "Email de Acesso", value: "mj.user6643@tempmail.net" },
        { label: "Senha", value: "M1djourn3y#Pr0" },
        { label: "Plano", value: "Premium - Geração Ilimitada" },
        { label: "Válido até", value: "25/10/2027" },
        { label: "Recursos", value: "Geração ilimitada (relax), 15h GPU turbo, Upscale 4K" },
        { label: "Instruções", value: "Acesse via Discord. Link de convite incluso no email." },
      ],
    ],
  },
  {
    productId: "canva-pro-1m",
    type: "subscription",
    label: "Canva Pro",
    items: [
      [
        { label: "Email de Acesso", value: "canva.pro.user2291@tempmail.net" },
        { label: "Senha", value: "C4nv4#Pr0@2026" },
        { label: "Plano", value: "Pro - Todos os recursos" },
        { label: "Válido até", value: "10/11/2027" },
        { label: "Recursos", value: "100M+ templates, Remoção de fundo IA, 100GB, Agendamento" },
        { label: "Instruções", value: "Login em canva.com. Ative o kit de branding." },
      ],
    ],
  },
  {
    productId: "figma-professional-1m",
    type: "subscription",
    label: "Figma Professional",
    items: [
      [
        { label: "Email de Acesso", value: "figma.pro.user7782@tempmail.net" },
        { label: "Senha", value: "F1gm4#Pr0f@26" },
        { label: "Plano", value: "Professional - Componentes ilimitados" },
        { label: "Válido até", value: "05/11/2027" },
        { label: "Recursos", value: "Componentes ilimitados, Bibliotecas de equipe, Modo Dev" },
        { label: "Instruções", value: "Login em figma.com. Aceite o convite da equipe." },
      ],
    ],
  },

  // ─── Licenças de Software ───
  {
    productId: "windows-11-pro",
    type: "license",
    label: "Windows 11 Pro - Licença Vitalícia",
    items: [
      [
        { label: "Tipo", value: "Licença Digital Vitalícia" },
        { label: "Chave de Ativação", value: "W269N-WFGWX-YVC9B-4J6C9-T83GX" },
        { label: "Sistema", value: "Windows 11 Pro (64-bit)" },
        { label: "Idiomas", value: "Todos os idiomas" },
        { label: "Ativação", value: "Digital License (vinculada ao hardware)" },
        { label: "Instruções", value: "Vá em Configurações > Sistema > Ativação > Alterar chave do produto. Insira a chave acima." },
        { label: "Suporte", value: "Ativação garantida. Se não funcionar, chame no chat." },
      ],
      [
        { label: "Tipo", value: "Licença Digital Vitalícia" },
        { label: "Chave de Ativação", value: "W269N-WFGWX-YVC9B-4J6C9-T84HY" },
        { label: "Sistema", value: "Windows 11 Pro (64-bit)" },
        { label: "Instruções", value: "Ativação online necessária. Não compartilhe a chave publicamente." },
      ],
    ],
  },
  {
    productId: "office-365-pro",
    type: "subscription",
    label: "Microsoft Office 365 Pro",
    items: [
      [
        { label: "Email de Acesso", value: "office.prouser3321@tempmail.net" },
        { label: "Senha", value: "0ffice#Pro@2026" },
        { label: "Plano", value: "Microsoft 365 Pro - 5 dispositivos" },
        { label: "Apps Inclusos", value: "Word, Excel, PowerPoint, Outlook, Teams, OneDrive 1TB" },
        { label: "Válido até", value: "15/11/2026" },
        { label: "Instruções", value: "Baixe em office.com. Instale em até 5 PCs/Macs." },
      ],
    ],
  },
  {
    productId: "antivirus-premium-3ano",
    type: "license",
    label: "Antivírus Premium - 3 Anos",
    items: [
      [
        { label: "Produto", value: "Norton 360 Premium" },
        { label: "Chave de Ativação", value: "N360-8X2K-4P9Q-M7NR-W3V6" },
        { label: "Duração", value: "3 anos - 5 dispositivos" },
        { label: "Recursos", value: "VPN ilimitada, Gerenciador de senhas, Dark Web Monitor" },
        { label: "Instruções", value: "Acesse norton.com/setup, insira a chave e faça login." },
      ],
    ],
  },
  {
    productId: "adobe-creative-cloud-1m",
    type: "subscription",
    label: "Adobe Creative Cloud PRO",
    items: [
      [
        { label: "Email de Acesso", value: "creative.user5541@tempmail.net" },
        { label: "Senha", value: "Cr3ativ3#Cloud!" },
        { label: "Plano", value: "Creative Cloud PRO - Todos os apps" },
        { label: "Apps Inclusos", value: "Photoshop, Illustrator, Premiere, After Effects, XD, etc" },
        { label: "Válido até", value: "20/12/2026" },
        { label: "Instruções", value: "Login em creative.adobe.com. Baixe os apps no Creative Cloud Desktop." },
      ],
    ],
  },

  // ─── Vouchers e Gift Cards ───
  {
    productId: "gift-card-psn-100",
    type: "voucher",
    label: "Gift Card PSN R$100",
    items: [
      [
        { label: "Valor", value: "R$ 100,00" },
        { label: "Código do Voucher", value: "PNS5-BR8X-2K4P-9Q7N" },
        { label: "Prazo de Resgate", value: "30/12/2027" },
        { label: "Instruções", value: "Vá em PlayStation Store > Resgatar Código. Insira o código acima." },
      ],
      [
        { label: "Valor", value: "R$ 100,00" },
        { label: "Código do Voucher", value: "PNS5-BR3Y-7L1Q-5R8M" },
        { label: "Prazo de Resgate", value: "30/12/2027" },
        { label: "Instruções", value: "Válido apenas para conta brasileira PSN." },
      ],
    ],
  },
  {
    productId: "gift-card-steam-200",
    type: "voucher",
    label: "Gift Card Steam R$200",
    items: [
      [
        { label: "Valor", value: "R$ 200,00" },
        { label: "Código do Voucher", value: "STEAM-BR8X2K4P9Q7N" },
        { label: "Prazo de Resgate", value: "30/06/2028" },
        { label: "Instruções", value: "Abra Steam > Adicionar uma Carteira > Resgatar código Steam." },
      ],
    ],
  },
  {
    productId: "gift-card-google-play",
    type: "voucher",
    label: "Gift Card Google Play R$50",
    items: [
      [
        { label: "Valor", value: "R$ 50,00" },
        { label: "Código do Voucher", value: "GPBR-4X7K2P9M5R8N" },
        { label: "Prazo de Resgate", value: "15/09/2027" },
        { label: "Instruções", value: "Abra Google Play > Resgatar > Insira o código." },
      ],
    ],
  },
];

export function getDigitalDelivery(
  productId: string,
  unitIndex: number = 0
): DeliveryContent[] | null {
  const product = DIGITAL_DELIVERIES.find((d) => d.productId === productId);
  if (!product) return null;
  const batch = product.items[unitIndex % product.items.length];
  return batch;
}

export function getDigitalDeliveryInfo(productId: string): {
  type: string;
  label: string;
  hasStock: boolean;
} | null {
  const product = DIGITAL_DELIVERIES.find((d) => d.productId === productId);
  if (!product) return null;
  return {
    type: product.type,
    label: product.label,
    hasStock: product.items.length > 0,
  };
}

export function isDigitalProduct(productId: string): boolean {
  return DIGITAL_DELIVERIES.some((d) => d.productId === productId);
}
