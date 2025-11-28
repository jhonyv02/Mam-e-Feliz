import { GuideStep, Lesson } from './types';

export const SOS_TIPS = [
  {
    title: "Pare e Respire",
    text: "Solte os ombros. A tensão aumenta a dor. O bebê sente se você está tensa. Vamos tentar relaxar juntos por 30 segundos."
  },
  {
    title: "Verifique a Boca",
    text: "Se está doendo muito, interrompa a sucção colocando o dedo mínimo no canto da boca do bebê (para tirar o vácuo) e tente de novo."
  },
  {
    title: "Posição de Alívio",
    text: "Tente a posição 'Invertida' (bola de futebol americano). Ela tira a pressão das áreas machucadas do mamilo."
  }
];

export const HEALING_TIPS = [
  {
    title: "O melhor remédio é o seu leite",
    content: "Após a mamada, passe um pouco do próprio leite no mamilo e deixe secar ao ar livre. O leite tem propriedades cicatrizantes naturais."
  },
  {
    title: "Pega correta é prevenção",
    content: "A fissura só cicatriza se o bebê não machucar mais. O bebê deve abocanhar a auréola, não só o bico. Boca de peixinho!"
  },
  {
    title: "Banho de Sol",
    content: "Se possível, deixe os seios tomarem 10-15 minutos de sol da manhã (antes das 10h) ou final da tarde. Ajuda a fortalecer a pele."
  },
  {
    title: "Evite sabonetes",
    content: "Não lave os mamilos com sabonete, pois resseca a proteção natural da pele. Água corrente no banho é suficiente."
  }
];

export const VISUAL_GUIDE_STEPS: GuideStep[] = [
  {
    title: "Boca bem aberta",
    description: "Espere o bebê abrir bem a boca (como se fosse bocejar) antes de trazer ele ao peito.",
    imageUrl: "https://picsum.photos/400/300?grayscale&blur=2" 
  },
  {
    title: "Queixo encostado",
    description: "O queixo do bebê deve tocar a mama primeiro. O nariz fica livre para respirar.",
    imageUrl: "https://picsum.photos/400/301?grayscale&blur=2"
  },
  {
    title: "Lábios virados para fora",
    description: "Os lábios do bebê (superior e inferior) devem estar virados para fora, fazendo a 'boquinha de peixe'.",
    imageUrl: "https://picsum.photos/400/302?grayscale&blur=2"
  },
  {
    title: "Barriga com Barriga",
    description: "O corpo do bebê deve estar totalmente voltado para você, barriga com barriga, bem apoiado.",
    imageUrl: "https://picsum.photos/400/303?grayscale&blur=2"
  }
];

export const LESSONS: Lesson[] = [
  {
    id: '1',
    title: "Por que dói?",
    duration: "2 min",
    content: "A amamentação não deve doer. Se dói, geralmente é a 'pega'. Quando o bebê pega só o bico, ele esmaga o mamilo contra o céu da boca duro. Quando ele pega a auréola, o mamilo vai lá no fundo, na parte mole, e não machuca."
  },
  {
    id: '2',
    title: "Mitos da Amamentação",
    duration: "3 min",
    content: "Não existe 'leite fraco'. Não precisa 'calejar' o peito com bucha (isso machuca!). O tamanho do seio não interfere na produção de leite. Você é capaz de nutrir seu bebê."
  },
  {
    id: '3',
    title: "O ciclo do medo",
    duration: "2 min",
    content: "Quando sentimos dor, ficamos tensas. A tensão inibe a ocitocina (o hormônio que ejeta o leite). O leite não sai, o bebê se irrita e morde mais. Para quebrar o ciclo, precisamos cuidar primeiro da sua dor e do seu relaxamento."
  }
];
