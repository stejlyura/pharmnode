export interface ChemicalClass {
  id: number;
  name: string;
  category: string;
}

export interface CompatibilityRule {
  classA: number;
  classB: number;
  type: 'incompatible' | 'synergy';
  severity: 'error' | 'warning';
  title: string;
  message: string;
  suggestion: string;
}

export const CHEMICAL_CLASSES: ChemicalClass[] = [
  // Amines
  { id: 1, category: "Амины и Азотсодержащие", name: "Первичные и вторичные амины" },
  { id: 2, category: "Амины и Азотсодержащие", name: "Третичные амины и четвертичные соли" },
  { id: 3, category: "Амины и Азотсодержащие", name: "Амиды и Имиды" },
  { id: 4, category: "Амины и Азотсодержащие", name: "Сульфаниламиды / Тиазиды" },
  { id: 5, category: "Амины и Азотсодержащие", name: "Алкалоиды / Ксантины" },
  
  // Acids and Salts
  { id: 6, category: "Кислоты, Соли и Эфиры", name: "Органические кислоты (алифатические)" },
  { id: 7, category: "Кислоты, Соли и Эфиры", name: "Органические кислоты (ароматические)" },
  { id: 8, category: "Кислоты, Соли и Эфиры", name: "Эфиры" },
  { id: 9, category: "Кислоты, Соли и Эфиры", name: "Щелочные соли жирных кислот (Стеараты)" },
  { id: 10, category: "Кислоты, Соли и Эфиры", name: "Щелочные неорганические соли (Карбонаты)" },
  { id: 11, category: "Кислоты, Соли и Эфиры", name: "Нейтральные неорганические соли" },
  { id: 12, category: "Кислоты, Соли и Эфиры", name: "Кислые неорганические соли" },
  { id: 13, category: "Кислоты, Соли и Эфиры", name: "Фосфаты кальция" },

  // Carbohydrates and Polymers
  { id: 14, category: "Углеводы и Полимеры", name: "Восстанавливающие сахара (Лактоза)" },
  { id: 15, category: "Углеводы и Полимеры", name: "Невосстанавливающие сахара (Сахароза)" },
  { id: 16, category: "Углеводы и Полимеры", name: "Полисахариды (МКЦ, Крахмал)" },
  { id: 17, category: "Углеводы и Полимеры", name: "Полиолы (Маннит, Сорбит)" },
  { id: 18, category: "Углеводы и Полимеры", name: "Модифицированные целлюлозы / SSG" },
  { id: 19, category: "Углеводы и Полимеры", name: "Водорастворимые синтетические полимеры (ПВП, ПЭГ)" },
  { id: 20, category: "Углеводы и Полимеры", name: "Нерастворимые синтетические полимеры" },

  // Specific groups
  { id: 21, category: "Специфические органические группы", name: "Фенолы" },
  { id: 22, category: "Специфические органические группы", name: "Стероиды / Гормоны" },
  { id: 23, category: "Специфические органические группы", name: "Жирорастворимые витамины" },
  { id: 24, category: "Специфические органические группы", name: "Водорастворимые витамины" },
  { id: 25, category: "Специфические органические группы", name: "Гликозиды" },
  { id: 26, category: "Специфические органические группы", name: "Липиды, воски, жирные кислоты" },
  { id: 27, category: "Специфические органические группы", name: "Белки, пептиды, ферменты" },

  // Minerals and Others
  { id: 28, category: "Минералы и Прочее", name: "Силикаты и диоксид кремния" },
  { id: 29, category: "Минералы и Прочее", name: "Оксиды металлов" },
  { id: 30, category: "Минералы и Прочее", name: "Пероксиды / Окислители" },
  { id: 31, category: "Минералы и Прочее", name: "Восстановители / Антиоксиданты" },
  { id: 32, category: "Минералы и Прочее", name: "Галогенсодержащие соединения" },
  { id: 33, category: "Минералы и Прочее", name: "Эфирные масла / Терпены" },
  { id: 34, category: "Минералы и Прочее", name: "Сорбенты" },
  { id: 35, category: "Минералы и Прочее", name: "Инертный / Прочий" },
];

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  // Maillard Reaction
  { classA: 1, classB: 14, type: 'incompatible', severity: 'error', title: 'Реакция Майяра', message: 'Первичная аминогруппа вступает в реакцию с альдегидной (редуцирующей) группой сахара. В присутствии влаги это вызывает потемнение смеси, образование токсичных адуктов и потерю активности АФС.', suggestion: 'Замените восстанавливающий сахар на инертный (Сахароза), Маннит или МКЦ.' },
  
  // Alkaline degradation of amines
  { classA: 1, classB: 9, type: 'incompatible', severity: 'error', title: 'Щелочная деградация', message: 'Щелочные соли (Стеараты) создают локальную щелочную микросреду, ускоряя гидролитическое расщепление аминов во влажной среде.', suggestion: 'Замените стеарат магния на стеариновую кислоту или ПРУВ.' },
  { classA: 1, classB: 10, type: 'incompatible', severity: 'error', title: 'Щелочная деградация', message: 'Карбонаты и другие щелочные неорганические соли разрушают первичные амины.', suggestion: 'Избегайте сильных щелочных агентов.' },
  
  // Acid-Base reactions
  { classA: 6, classB: 9, type: 'incompatible', severity: 'warning', title: 'Кислотно-основное взаимодействие', message: 'Алифатическая органическая кислота реагирует со щелочным лубрикантом, разрушая смазывающую решетку стеарата.', suggestion: 'Используйте кислый или нейтральный лубрикант.' },
  { classA: 7, classB: 9, type: 'incompatible', severity: 'warning', title: 'Кислотно-основное взаимодействие', message: 'Ароматическая органическая кислота реагирует со щелочным лубрикантом, разрушая смазывающую решетку стеарата.', suggestion: 'Используйте кислый или нейтральный лубрикант.' },
  { classA: 6, classB: 10, type: 'incompatible', severity: 'error', title: 'Газообразование', message: 'Органические кислоты реагируют с карбонатами с выделением углекислого газа во влажной среде, что приведет к вздутию и разрушению таблетки.', suggestion: 'Избегайте карбонатов, если это не шипучая таблетка.' },
  
  // Phenols and polymers complexation
  { classA: 21, classB: 19, type: 'incompatible', severity: 'warning', title: 'Комплексообразование', message: 'Фенольные группы способны образовывать водородные связи с полимерными цепями (ПВП, ПЭГ), что может замедлить растворение in vitro.', suggestion: 'Проверьте кинетику высвобождения, возможно потребуется увеличить долю дезинтегранта.' },
  
  // Vitamins and Metals/Alkalis
  { classA: 23, classB: 9, type: 'incompatible', severity: 'error', title: 'Деградация витамина', message: 'Жирорастворимые витамины крайне чувствительны к щелочной среде стеаратов.', suggestion: 'Используйте антиоксиданты и нейтральные наполнители.' },
  { classA: 23, classB: 10, type: 'incompatible', severity: 'error', title: 'Деградация витамина', message: 'Жирорастворимые витамины окисляются в щелочной среде неорганических солей.', suggestion: 'Используйте антиоксиданты и нейтральные наполнители.' },
  { classA: 23, classB: 28, type: 'incompatible', severity: 'error', title: 'Деградация витамина', message: 'Следовые количества тяжелых металлов в силикатах (Тальк) катализируют окисление витаминов.', suggestion: 'Избегайте талька или используйте хелатирующие агенты (ЭДТА).' },
  { classA: 23, classB: 13, type: 'incompatible', severity: 'error', title: 'Деградация витамина', message: 'Ионы кальция и следовые металлы в фосфатах катализируют деградацию витамина.', suggestion: 'Избегайте неорганических солей.' },
  { classA: 6, classB: 13, type: 'incompatible', severity: 'error', title: 'Металл-катализируемое окисление', message: 'Двухвалентные ионы кальция в составе фосфата катализируют окисление алифатических органических кислот (например, Витамина С).', suggestion: 'Используйте Маннит или МКЦ.' },
  
  // Calcium salts and organic acids
  { classA: 7, classB: 13, type: 'incompatible', severity: 'warning', title: 'Образование нерастворимых солей', message: 'Взаимодействие ароматической органической кислоты с кальциевой солью образует малорастворимые комплексы, снижая биодоступность.', suggestion: 'Замените на нейтральный наполнитель.' },
  { classA: 26, classB: 13, type: 'incompatible', severity: 'warning', title: 'Омыление in situ', message: 'Жирные кислоты (Стеариновая к-та) образуют нерастворимые кальциевые соли при контакте с фосфатами.', suggestion: 'Рассмотрите замену лубриканта.' },
  
  // Amines and polyols
  { classA: 1, classB: 17, type: 'incompatible', severity: 'warning', title: 'Реакция с микропримесями', message: 'Полиолы (Сорбит) могут содержать следовые количества редуцирующих сахаров, которые вступают в реакцию с первичными аминами.', suggestion: 'Используйте очищенный Маннит или МКЦ.' },
  
  // Proteins
  { classA: 27, classB: 9, type: 'incompatible', severity: 'warning', title: 'Денатурация в щелочной среде', message: 'Белки и ферменты подвержены щелочному гидролизу в присутствии щелочных солей.', suggestion: 'Используйте нейтральную среду.' }
];

export function getCompatibilityRule(classA: number, classB: number): CompatibilityRule | null {
  for (const rule of COMPATIBILITY_RULES) {
    if ((rule.classA === classA && rule.classB === classB) || (rule.classA === classB && rule.classB === classA)) {
      return rule;
    }
  }
  return null;
}
