import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivityConfigService, ActivityDimension } from '../../../core/services/activity-config.service';

interface FonemaItem {
  fonema: string;
  word: string;
  imageUrl: string;
  wordPosition: 'INICIAL' | 'MEDIA' | 'FINAL';
}

interface ParMinimo { word1: string; image1: string; word2: string; image2: string; }

const PAIRS_CATALOG: Record<string, { label: string; pairs: ParMinimo[] }> = {
  oclusivas: {
    label: 'Oclusivas /p/-/b/, /t/-/d/, /k/-/g/',
    pairs: [
      { word1: 'PATO',  image1: 'https://cdn-icons-png.flaticon.com/512/2120/2120233.png', word2: 'GATO',  image2: 'https://cdn-icons-png.flaticon.com/128/1998/1998592.png' },
      { word1: 'BOCA',  image1: 'https://cdn-icons-png.flaticon.com/128/1471/1471735.png', word2: 'FOCA',  image2: 'https://cdn-icons-png.flaticon.com/128/1998/1998783.png' },
      { word1: 'TAZA',  image1: 'https://cdn-icons-png.flaticon.com/128/590/590836.png',   word2: 'CASA',  image2: 'https://cdn-icons-png.flaticon.com/512/25/25694.png'     },
      { word1: 'POLO',  image1: 'https://cdn-icons-png.flaticon.com/128/7555/7555339.png', word2: 'BOLO',  image2: 'https://cdn-icons-png.flaticon.com/128/10889/10889043.png'},
    ]
  },
  vibrante_lateral: {
    label: 'Vibrante /r/ vs Lateral /l/',
    pairs: [
      { word1: 'RATA',  image1: 'https://cdn-icons-png.flaticon.com/128/2636/2636834.png', word2: 'LATA',  image2: 'https://cdn-icons-png.flaticon.com/128/2769/2769611.png' },
      { word1: 'ROSA',  image1: 'https://cdn-icons-png.flaticon.com/128/14761/14761548.png', word2: 'LOSA',  image2: 'https://cdn-icons-png.flaticon.com/128/17064/17064953.png' },
      { word1: 'CARO',  image1: 'https://cdn-icons-png.flaticon.com/128/10384/10384161.png', word2: 'CALO',  image2: 'https://cdn-icons-png.flaticon.com/512/869/869869.png'    },
    ]
  },
  sinfones: {
    label: 'Sinfones vs Simples',
    pairs: [
      { word1: 'PATO',  image1: 'https://cdn-icons-png.flaticon.com/512/2120/2120233.png', word2: 'PLATO', image2: 'https://cdn-icons-png.flaticon.com/512/2771/2771406.png'  },
      { word1: 'POLO',  image1: 'https://cdn-icons-png.flaticon.com/128/7555/7555339.png',  word2: 'POLLO', image2: 'https://cdn-icons-png.flaticon.com/128/2002/2002616.png'  },
      { word1: 'TREN',  image1: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', word2: 'TEN',   image2: 'https://cdn-icons-png.flaticon.com/128/237/237668.png'     },
    ]
  },
  fricativas: {
    label: 'Fricativas /f/-/s/-/j/',
    pairs: [
      { word1: 'SOL',   image1: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',   word2: 'COL',   image2: 'https://cdn-icons-png.flaticon.com/512/2153/2153786.png'  },
      { word1: 'FOCA',  image1: 'https://cdn-icons-png.flaticon.com/128/1998/1998783.png', word2: 'SOCA',  image2: 'https://cdn-icons-png.flaticon.com/128/2664/2664593.png' },
      { word1: 'JABÓN', image1: 'https://cdn-icons-png.flaticon.com/128/6966/6966724.png', word2: 'SABÓN', image2: 'https://cdn-icons-png.flaticon.com/128/2775/2775875.png' },
    ]
  }
};

const PHONEME_CATALOG: Record<string, { label: string; items: FonemaItem[] }> = {
  bilabiales: {
    label: 'Bilabiales /p/ /b/ /m/',
    items: [
      { fonema: '/p/', word: 'PATO',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/2120/2120233.png', wordPosition: 'INICIAL' },
      { fonema: '/p/', word: 'COPA',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', wordPosition: 'MEDIA'   },
      { fonema: '/p/', word: 'MAPA',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/854/854929.png',   wordPosition: 'FINAL'   },
      { fonema: '/b/', word: 'BOCA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/1471/1471735.png', wordPosition: 'INICIAL' },
      { fonema: '/b/', word: 'LOBO',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/141/141850.png', wordPosition: 'MEDIA'   },
      { fonema: '/m/', word: 'MESA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/607/607069.png', wordPosition: 'INICIAL' },
      { fonema: '/m/', word: 'CAMA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/3837/3837744.png', wordPosition: 'MEDIA'   },
    ]  
  },
  dentales: {
    label: 'Dentales /t/ /d/',
    items: [
      { fonema: '/t/', word: 'TAZA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/590/590836.png', wordPosition: 'INICIAL' },
      { fonema: '/t/', word: 'PATO',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/2120/2120233.png', wordPosition: 'MEDIA'   },
      { fonema: '/d/', word: 'DEDO',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/305/305489.png', wordPosition: 'INICIAL' },
      { fonema: '/d/', word: 'NIDO',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/427/427432.png', wordPosition: 'MEDIA'   },
    ]
  }, 
  alveolares: {
    label: 'Alveolares /n/ /l/ /s/ /r/',
    items: [
      { fonema: '/n/', word: 'NARIZ',  imageUrl: 'https://cdn-icons-png.flaticon.com/128/7292/7292552.png', wordPosition: 'INICIAL' },
      { fonema: '/n/', word: 'LUNA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/9689/9689786.png',   wordPosition: 'MEDIA'   },
      { fonema: '/l/', word: 'LLAVE',  imageUrl: 'https://cdn-icons-png.flaticon.com/128/807/807241.png', wordPosition: 'INICIAL' },
      { fonema: '/l/', word: 'BOLA',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/53/53283.png',     wordPosition: 'MEDIA'   },
      { fonema: '/s/', word: 'SOL',    imageUrl: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',   wordPosition: 'INICIAL' },
      { fonema: '/r/', word: 'ROSA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/14761/14761548.png', wordPosition: 'INICIAL' },
      { fonema: '/r/', word: 'PERA',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/415/415735.png',   wordPosition: 'MEDIA'   },
    ]  
  },          
  palatales: {
    label: 'Palatales /ch/ /ñ/ /ll/ /y/',
    items: [
      { fonema: '/ch/', word: 'LECHE', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2674/2674486.png', wordPosition: 'MEDIA'   },
      { fonema: '/ñ/',  word: 'NIÑO',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048127.png', wordPosition: 'MEDIA'   },
      { fonema: '/ll/', word: 'LLAVE', imageUrl: 'https://cdn-icons-png.flaticon.com/128/807/807241.png', wordPosition: 'INICIAL' },
      { fonema: '/ll/', word: 'POLLO', imageUrl: 'https://cdn-icons-png.flaticon.com/128/2002/2002616.png', wordPosition: 'MEDIA'   },
    ]
  },
  velares: {
    label: 'Velares /k/ /g/ /j/',
    items: [
      { fonema: '/k/', word: 'CASA',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',     wordPosition: 'INICIAL' },
      { fonema: '/k/', word: 'VACA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/3319/3319367.png', wordPosition: 'MEDIA'   },
      { fonema: '/g/', word: 'GATO',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/1998/1998592.png',   wordPosition: 'INICIAL' },
      { fonema: '/g/', word: 'AGUA',   imageUrl: 'https://cdn-icons-png.flaticon.com/128/2792/2792706.png', wordPosition: 'MEDIA'   },
      { fonema: '/j/', word: 'JABÓN',  imageUrl: 'https://cdn-icons-png.flaticon.com/128/7263/7263291.png', wordPosition: 'INICIAL' },
    ]
  },                
  sinfones: {
    label: 'Sinfones /bl/ /br/ /pl/ /pr/ /tr/ /gr/ /fl/',
    items: [
      { fonema: '/bl/', word: 'BLUSA',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/863/863684.png',   wordPosition: 'INICIAL' },
      { fonema: '/br/', word: 'BRAZO',  imageUrl: 'https://cdn-icons-png.flaticon.com/128/7118/7118235.png', wordPosition: 'INICIAL' },
      { fonema: '/pl/', word: 'PLATO',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/2771/2771406.png', wordPosition: 'INICIAL' },
      { fonema: '/tr/', word: 'TREN',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', wordPosition: 'INICIAL' },
      { fonema: '/gr/', word: 'GRANJA', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2592/2592048.png', wordPosition: 'INICIAL' },
      { fonema: '/fl/', word: 'FLOR',   imageUrl: 'https://cdn-icons-png.flaticon.com/512/628/628283.png',  wordPosition: 'INICIAL' },
    ]
  },                          
  diptongos: {
    label: 'Diptongos /au/ /ei/ /ie/ /ue/',
    items: [
      { fonema: '/au/', word: 'JAULA',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/2785/2785445.png', wordPosition: 'MEDIA'   },
      { fonema: '/ei/', word: 'PEINE',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/3418/3418157.png', wordPosition: 'MEDIA'   },
      { fonema: '/ie/', word: 'PIEDRA', imageUrl: 'https://cdn-icons-png.flaticon.com/512/5774/5774132.png', wordPosition: 'INICIAL' },
      { fonema: '/ue/', word: 'HUEVO',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/837/837595.png',   wordPosition: 'INICIAL' },
      { fonema: '/ue/', word: 'FUEGO',  imageUrl: 'https://cdn-icons-png.flaticon.com/512/785/785116.png',   wordPosition: 'MEDIA'   },
    ]
  }
};

@Component({
  selector: 'app-activity-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-builder.component.html',
  styleUrl: './activity-builder.component.css'
})
export class ActivityBuilderComponent {
  configService = inject(ActivityConfigService);
  router = inject(Router);

  activityTitle = signal('');
  dimension = signal<ActivityDimension>('FONOLOGIA');
  activityType = signal<number>(1);

  // Act 1: Producción de Fonemas
  phonemeGroup = signal<string>('bilabiales');
  readonly phonemeCatalogKeys = Object.keys(PHONEME_CATALOG);
  readonly phonemeCatalog = PHONEME_CATALOG;

  // Act 2: Pares Mínimos
  pairsGroup = signal<string>('oclusivas');
  readonly pairsCatalogKeys = Object.keys(PAIRS_CATALOG);
  readonly pairsCatalog = PAIRS_CATALOG;

  // Flashcard Temp State (Act 2, 4, 7, 8)
  flashcardWord = signal('');
  flashcardImageUrl = signal('');
  // For Act 2: second image for pair
  flashcardWord2 = signal('');
  flashcardImageUrl2 = signal('');

  // Checklist / Opciones Múltiples (Act 3, 9, 10)
  checklistMainQ = signal('');
  checklistQuestions = signal<{text: string; isCorrect: boolean}[]>([]);
  newQuestionText = signal('');
  // For Act 9/10: educational level selection
  educationalLevel = signal<'preescolar' | 'primaria' | 'secundaria'>('primaria');

  // Escritura IA (Act 5)
  iaPrompt = signal('');

  // Plan de Acción (Act 6) — no config needed, it generates from history

  // Secuencias (Act 11)
  sequenceMainQ = signal('');
  sequenceSteps = signal<string[]>([]);
  newSequenceStepText = signal('');

  setActivityType(type: number) {
    this.activityType.set(type);
    // Auto-set dimension based on activity type per spec
    const dimMap: Record<number, ActivityDimension> = {
      1: 'FONOLOGIA', 2: 'FONOLOGIA',
      3: 'PRAGMATICA',
      4: 'MORFOSINTAXIS', 5: 'MORFOSINTAXIS',
      6: 'MORFOSINTAXIS',
      7: 'SEMANTICA', 8: 'SEMANTICA',
      9: 'DISCURSOS', 10: 'DISCURSOS',
      11: 'JUEGO'
    };
    if (dimMap[type]) this.dimension.set(dimMap[type]);
  }

  // --- Opciones Múltiples ---
  addQuestion() {
    if (this.newQuestionText().trim()) {
      this.checklistQuestions.update(qs => [...qs, { text: this.newQuestionText(), isCorrect: false }]);
      this.newQuestionText.set('');
    }
  }

  removeQuestion(index: number) {
    this.checklistQuestions.update(qs => qs.filter((_, i) => i !== index));
  }

  toggleCorrect(index: number) {
    this.checklistQuestions.update(qs =>
      qs.map((q, i) => ({ ...q, isCorrect: i === index }))
    );
  }

  // --- Secuencias ---
  addSequenceStep() {
    if (this.newSequenceStepText().trim()) {
      this.sequenceSteps.update(ss => [...ss, this.newSequenceStepText()]);
      this.newSequenceStepText.set('');
    }
  }

  removeSequenceStep(index: number) {
    this.sequenceSteps.update(ss => ss.filter((_, i) => i !== index));
  }

  // --- Guardar ---
  saveConfiguration() {
    const id = 'act_' + Date.now();
    let specificConfig: any = {};

    const type = this.activityType();

    if (type === 1) {
      // Producción de Fonemas — usa catálogo de fonemas
      const group = PHONEME_CATALOG[this.phonemeGroup()];
      specificConfig = {
        phonemeGroup: group?.label ?? this.phonemeGroup(),
        items: group?.items ?? []
      };
    } else if (type === 4 || type === 7 || type === 8) {
      // Standard flashcard
      specificConfig = { targetWord: this.flashcardWord(), imageUrl: this.flashcardImageUrl() };
    } else if (type === 2) {
      const pairSet = PAIRS_CATALOG[this.pairsGroup()];
      specificConfig = {
        pairSetLabel: pairSet?.label ?? this.pairsGroup(),
        pairs: pairSet?.pairs ?? []
      };
    } else if (type === 3) {
      // Pragmática — ítems fijos del instrumento, sin config extra
      specificConfig = { pragmaticaMode: true };
    } else if (type === 5) {
      specificConfig = { question: this.iaPrompt() };
    } else if (type === 6) {
      specificConfig = { title: this.activityTitle() };
    } else if (type === 9 || type === 10) {
      const options = this.checklistQuestions().map(q => q.text);
      const correctIndex = this.checklistQuestions().findIndex(q => q.isCorrect);
      specificConfig = {
        question: this.checklistMainQ(),
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        educationalLevel: this.educationalLevel()
      };
    } else if (type === 11) {
      specificConfig = { question: this.sequenceMainQ(), steps: this.sequenceSteps() };
    }

    const saved = this.configService.saveActivity({
      id,
      title: this.activityTitle(),
      dimension: this.dimension(),
      activityType: type,
      config: specificConfig,
      createdAt: new Date()
    });

    if (saved) {
      // Limpiar formulario
      this.activityTitle.set('');
      this.phonemeGroup.set('bilabiales');
      this.pairsGroup.set('oclusivas');
      this.flashcardWord.set('');
      this.flashcardImageUrl.set('');
      this.flashcardWord2.set('');
      this.flashcardImageUrl2.set('');
      this.checklistMainQ.set('');
      this.checklistQuestions.set([]);
      this.iaPrompt.set('');
      this.sequenceMainQ.set('');
      this.sequenceSteps.set([]);
      // Navegar al engine para probar
      this.router.navigate(['/actividades/engine', id]);
    }
  }

  // Helper methods for template
  isFlashcardType(): boolean {
    return [2, 4, 7, 8].includes(this.activityType());
  }

  isChecklistType(): boolean {
    return [3, 9, 10].includes(this.activityType());
  }

  getTypeLabel(type: number): string {
    const labels: Record<number, string> = {
      1: 'Act 1 · Producción de Fonemas',
      2: 'Act 2 · Pares Mínimos',
      3: 'Act 3 · Checklist Pragmática',
      4: 'Act 4 · Tarjetas por Niveles',
      5: 'Act 5 · Análisis IA',
      6: 'Act 6 · Plan de Acción',
      7: 'Act 7 · La Comidita',
      8: 'Act 8 · Preguntas sobre Imagen',
      9: 'Act 9 · Conversación',
      10: 'Act 10 · Argumentación',
      11: 'Act 11 · Estadios de Juego'
    };
    return labels[type] || '';
  }
}
