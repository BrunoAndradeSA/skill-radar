import type { Question } from '../../models/Question';

export const questions: Question[] = [
  {
    "id": "q-java-01",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-oop"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Considere o seguinte trecho de código Java:\n```java\nclass Animal {\n    public void speak() { System.out.println(\"Generic animal sound\"); }\n}\nclass Dog extends Animal {\n    @Override\n    public void speak() { System.out.println(\"Bark\"); }\n}\n```\nQual conceito fundamental de Programação Orientada a Objetos (POO) é demonstrado pela anotação `@Override` e pela capacidade da subclasse fornecer uma implementação específica do método `speak()`?",
    "alternatives": [
      {
        "id": "alt-java-1-1",
        "text": "Polimorfismo de sobrescrita (Dynamic Dispatch).",
        "isCorrect": true
      },
      {
        "id": "alt-java-1-2",
        "text": "Encapsulamento estrito.",
        "isCorrect": false
      },
      {
        "id": "alt-java-1-3",
        "text": "Herança múltipla.",
        "isCorrect": false
      },
      {
        "id": "alt-java-1-4",
        "text": "Sobrecarga de métodos (Overloading).",
        "isCorrect": false
      }
    ],
    "explanation": "A sobrescrita de método (@Override) é a base do polimorfismo dinâmico em Java, onde a JVM decide em tempo de execução qual método executar com base no tipo real do objeto na memória."
  },
  {
    "id": "q-java-02",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-oop"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Em Java, interfaces podem conter implementações de métodos. Qual palavra-chave introduzida no Java 8 permite definir um método com corpo dentro de uma interface sem obrigar as classes implementadoras a sobrescrevê-lo?",
    "alternatives": [
      {
        "id": "alt-java-2-1",
        "text": "default",
        "isCorrect": true
      },
      {
        "id": "alt-java-2-2",
        "text": "static",
        "isCorrect": false
      },
      {
        "id": "alt-java-2-3",
        "text": "abstract",
        "isCorrect": false
      },
      {
        "id": "alt-java-2-4",
        "text": "protected",
        "isCorrect": false
      }
    ],
    "explanation": "A palavra-chave default permite que interfaces definam implementações padrão para métodos a partir do Java 8, ajudando a evoluir interfaces legadas sem quebrar a retrocompatibilidade."
  },
  {
    "id": "q-java-03",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-oop"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual será a saída do seguinte código Java ao tentar compilar e executar?\n```java\npublic class Test {\n    public static void main(String[] args) {\n        String s1 = \"radar\";\n        String s2 = new String(\"radar\");\n        System.out.print((s1 == s2) + \" \" + s1.equals(s2));\n    }\n}\n```",
    "alternatives": [
      {
        "id": "alt-java-3-1",
        "text": "false true",
        "isCorrect": true
      },
      {
        "id": "alt-java-3-2",
        "text": "true true",
        "isCorrect": false
      },
      {
        "id": "alt-java-3-3",
        "text": "false false",
        "isCorrect": false
      },
      {
        "id": "alt-java-3-4",
        "text": "true false",
        "isCorrect": false
      }
    ],
    "explanation": "O operador == compara referências na memória. s1 está no String Pool e s2 é criado no Heap. O método equals compara o valor textual."
  },
  {
    "id": "q-java-04",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-oop"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Sobre classes aninhadas em Java (Nested Classes), qual das seguintes afirmações sobre classes internas estáticas (Static Nested Classes) e internas não-estáticas (Inner Classes) é verdadeira?",
    "alternatives": [
      {
        "id": "alt-java-4-1",
        "text": "Classes internas não-estáticas mantêm uma referência implícita para a instância da classe externa, podendo acessar todos os seus membros privados.",
        "isCorrect": true
      },
      {
        "id": "alt-java-4-2",
        "text": "Classes internas estáticas podem instanciar diretamente membros não-estáticos da classe externa sem precisar de uma referência de objeto.",
        "isCorrect": false
      },
      {
        "id": "alt-java-4-3",
        "text": "Ambas as classes possuem acesso idêntico a variáveis locais de métodos que as definem.",
        "isCorrect": false
      },
      {
        "id": "alt-java-4-4",
        "text": "Não é permitido criar classes aninhadas privadas em Java.",
        "isCorrect": false
      }
    ],
    "explanation": "Classes internas não-estáticas possuem um link oculto (this$0) para a instância externa. Classes estáticas não possuem e funcionam como classes de nível superior."
  },
  {
    "id": "q-java-05",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-concurrency"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Para iniciar uma nova thread em Java que execute uma determinada lógica, qual é a abordagem recomendada usando interfaces funcionais?",
    "alternatives": [
      {
        "id": "alt-java-5-1",
        "text": "Instanciar um objeto Thread passando uma implementação da interface Runnable para o construtor, e então chamar o método start().",
        "isCorrect": true
      },
      {
        "id": "alt-java-5-2",
        "text": "Chamar diretamente o método run() da classe Thread.",
        "isCorrect": false
      },
      {
        "id": "alt-java-5-3",
        "text": "Implementar a interface Callable e chamar call() diretamente.",
        "isCorrect": false
      },
      {
        "id": "alt-java-5-4",
        "text": "Instanciar Thread e chamar run() com parâmetros.",
        "isCorrect": false
      }
    ],
    "explanation": "A forma padrão é passar um Runnable (ou expressão Lambda condizente) para o construtor de Thread e chamar start(). Chamar run() diretamente executa o método na thread atual."
  },
  {
    "id": "q-java-06",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-concurrency"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Considere o uso de variáveis voláteis em Java com a palavra-chave `volatile`. Qual é a garantia dada por essa palavra-chave ao acessar a variável em cenários concorrentes?",
    "alternatives": [
      {
        "id": "alt-java-6-1",
        "text": "Garante que as leituras e escritas da variável sejam feitas diretamente na memória principal, e não em caches locais de processadores.",
        "isCorrect": true
      },
      {
        "id": "alt-java-6-2",
        "text": "Torna as operações compostas (como incremento x++) estritamente atômicas.",
        "isCorrect": false
      },
      {
        "id": "alt-java-6-3",
        "text": "Funciona como um lock de exclusão mútua idêntico ao synchronized.",
        "isCorrect": false
      },
      {
        "id": "alt-java-6-4",
        "text": "Impede que o Garbage Collector limpe o objeto referenciado por ela.",
        "isCorrect": false
      }
    ],
    "explanation": "A palavra-chave volatile em Java assegura visibilidade de escrita nas threads, garantindo que o valor atualizado seja publicado diretamente na memória principal, evitando problemas de cache local."
  },
  {
    "id": "q-java-07",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-concurrency"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual classe do pacote `java.util.concurrent` é mais indicada para coordenar múltiplas threads onde uma thread principal precisa aguardar que um conjunto de threads de trabalho termine suas tarefas?",
    "alternatives": [
      {
        "id": "alt-java-7-1",
        "text": "CountDownLatch",
        "isCorrect": true
      },
      {
        "id": "alt-java-7-2",
        "text": "Semaphore",
        "isCorrect": false
      },
      {
        "id": "alt-java-7-3",
        "text": "Exchanger",
        "isCorrect": false
      },
      {
        "id": "alt-java-7-4",
        "text": "ConcurrentHashMap",
        "isCorrect": false
      }
    ],
    "explanation": "CountDownLatch é inicializado com um contador. A thread principal executa await() e as de trabalho countDown(). Quando o contador chega a zero, a thread principal é liberada."
  },
  {
    "id": "q-java-08",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-concurrency"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "O que pode ocorrer se duas threads em Java tentarem obter simultaneamente locks diferentes na ordem reversa, como demonstrado a seguir?\n```java\n// Thread A\nsynchronized(lock1) {\n    synchronized(lock2) { ... }\n}\n// Thread B\nsynchronized(lock2) {\n    synchronized(lock1) { ... }\n}\n```",
    "alternatives": [
      {
        "id": "alt-java-8-1",
        "text": "Um deadlock poderá ocorrer se ambas as threads travarem o primeiro lock e tentarem obter o segundo concorrentemente.",
        "isCorrect": true
      },
      {
        "id": "alt-java-8-2",
        "text": "A JVM irá lançar um ConcurrentModificationException automaticamente.",
        "isCorrect": false
      },
      {
        "id": "alt-java-8-3",
        "text": "O Garbage Collector interromperá a execução de ambas e liberará os locks.",
        "isCorrect": false
      },
      {
        "id": "alt-java-8-4",
        "text": "A Thread A terá prioridade automática por ordem alfabética de variáveis.",
        "isCorrect": false
      }
    ],
    "explanation": "A obtenção de travas de forma circular/aninhada e reversa é o clássico exemplo gerador de deadlock em sistemas concorrentes."
  },
  {
    "id": "q-java-09",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-streams"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "O que o seguinte pipeline de Streams em Java retorna?\n```java\nList<String> words = List.of(\"apple\", \"banana\", \"avocado\", \"cherry\");\nlong count = words.stream()\n                  .filter(s -> s.startsWith(\"a\"))\n                  .count();\n```",
    "alternatives": [
      {
        "id": "alt-java-9-1",
        "text": "Um valor do tipo long igual a 2.",
        "isCorrect": true
      },
      {
        "id": "alt-java-9-2",
        "text": "Uma lista contendo \"apple\" e \"avocado\".",
        "isCorrect": false
      },
      {
        "id": "alt-java-9-3",
        "text": "Um erro de compilação por falta de coletores.",
        "isCorrect": false
      },
      {
        "id": "alt-java-9-4",
        "text": "Um valor do tipo long igual a 4.",
        "isCorrect": false
      }
    ],
    "explanation": "O filtro retém as strings que começam com \"a\" (\"apple\" e \"avocado\"). O método count() conta a quantidade de elementos restantes no Stream."
  },
  {
    "id": "q-java-10",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-streams"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Em Java Streams, qual método é considerado uma operação terminal?",
    "alternatives": [
      {
        "id": "alt-java-10-1",
        "text": "collect(Collector.toList())",
        "isCorrect": true
      },
      {
        "id": "alt-java-10-2",
        "text": "map(Function mapper)",
        "isCorrect": false
      },
      {
        "id": "alt-java-10-3",
        "text": "filter(Predicate predicate)",
        "isCorrect": false
      },
      {
        "id": "alt-java-10-4",
        "text": "flatMap(Function mapper)",
        "isCorrect": false
      }
    ],
    "explanation": "Operações intermediárias (como map, filter, flatMap) retornam outro Stream. Operações terminais (como collect, forEach, count) encerram e iniciam o processamento."
  },
  {
    "id": "q-java-11",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-streams"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Ao utilizar Streams em Java, qual a diferença crucial de comportamento entre `map` e `flatMap`?",
    "alternatives": [
      {
        "id": "alt-java-11-1",
        "text": "O método map transforma cada elemento em um novo valor, enquanto o flatMap transforma cada elemento em um Stream e os achata em um único Stream unificado.",
        "isCorrect": true
      },
      {
        "id": "alt-java-11-2",
        "text": "O método flatMap é executado de forma paralela por padrão e o map não.",
        "isCorrect": false
      },
      {
        "id": "alt-java-11-3",
        "text": "O método map só aceita lambdas puras e flatMap aceita referências de métodos estáticos.",
        "isCorrect": false
      },
      {
        "id": "alt-java-11-4",
        "text": "O flatMap altera a lista original por referência.",
        "isCorrect": false
      }
    ],
    "explanation": "flatMap transforma uma estrutura dimensional aninhada (ex: List de Lists) em um Stream unidimensional achatado."
  },
  {
    "id": "q-java-12",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-jvm"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual é o erro lançado pela JVM quando o Heap de memória está cheio e o Garbage Collector não consegue liberar mais espaço para novos objetos?",
    "alternatives": [
      {
        "id": "alt-java-12-1",
        "text": "java.lang.OutOfMemoryError: Java heap space",
        "isCorrect": true
      },
      {
        "id": "alt-java-12-2",
        "text": "java.lang.StackOverflowError",
        "isCorrect": false
      },
      {
        "id": "alt-java-12-3",
        "text": "java.lang.NullPointerException",
        "isCorrect": false
      },
      {
        "id": "alt-java-12-4",
        "text": "java.lang.ClassCastException",
        "isCorrect": false
      }
    ],
    "explanation": "OutOfMemoryError: Java heap space ocorre quando há falta de recursos físicos no Heap para novos objetos após várias passagens do GC."
  },
  {
    "id": "q-java-13",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-jvm"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual argumento da linha de comando da JVM é utilizado para definir o tamanho máximo do Heap de memória Java?",
    "alternatives": [
      {
        "id": "alt-java-13-1",
        "text": "-Xmx",
        "isCorrect": true
      },
      {
        "id": "alt-java-13-2",
        "text": "-Xms",
        "isCorrect": false
      },
      {
        "id": "alt-java-13-3",
        "text": "-XX:MaxMetaspaceSize",
        "isCorrect": false
      },
      {
        "id": "alt-java-13-4",
        "text": "-Xss",
        "isCorrect": false
      }
    ],
    "explanation": "-Xmx define o tamanho máximo do heap (ex: -Xmx4g). -Xms define o tamanho inicial."
  },
  {
    "id": "q-java-14",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-jvm"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Em relação à JVM, qual área de memória armazena as variáveis locais e referências de controle de fluxo de execução de um método de uma thread específica?",
    "alternatives": [
      {
        "id": "alt-java-14-1",
        "text": "JVM Stack (Pilha da Thread)",
        "isCorrect": true
      },
      {
        "id": "alt-java-14-2",
        "text": "Heap Space",
        "isCorrect": false
      },
      {
        "id": "alt-java-14-3",
        "text": "Metaspace",
        "isCorrect": false
      },
      {
        "id": "alt-java-14-4",
        "text": "Constant Pool",
        "isCorrect": false
      }
    ],
    "explanation": "A Stack armazena frames de execução de métodos específicos da thread contendo suas variáveis locais e tipos primitivos de escopo local."
  },
  {
    "id": "q-java-15",
    "themeId": "theme-java",
    "competencyIds": [
      "comp-java-jvm"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Qual das seguintes opções descreve corretamente o funcionamento do Garbage Collector G1 (Garbage-First) da JVM?",
    "alternatives": [
      {
        "id": "alt-java-15-1",
        "text": "Ele divide o heap em várias regiões de tamanho igual e prioriza a coleta das regiões que contêm a maior quantidade de dados lixo (garbages).",
        "isCorrect": true
      },
      {
        "id": "alt-java-15-2",
        "text": "Ele desativa totalmente o heap tradicional e realiza alocações apenas em memória nativa (Off-Heap).",
        "isCorrect": false
      },
      {
        "id": "alt-java-15-3",
        "text": "Ele exige paradas completas Stop-the-World durante 100% do tempo de coleta de forma síncrona.",
        "isCorrect": false
      },
      {
        "id": "alt-java-15-4",
        "text": "É um algoritmo linear que processa as gerações Young e Old de forma única e sem segmentação de espaço.",
        "isCorrect": false
      }
    ],
    "explanation": "O G1 divide o Heap em regiões lógicas (Eden, Survivor, Old) e coleta incrementalmente focando em regiões com maior proporção de objetos mortos (daí o nome Garbage-First)."
  },
  {
    "id": "q-springboot-01",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-di"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual anotação do Spring Framework é usada para indicar que uma classe desempenha o papel de um componente de serviço comercial e deve ser registrada no container IoC?",
    "alternatives": [
      {
        "id": "alt-spring-1-1",
        "text": "@Service",
        "isCorrect": true
      },
      {
        "id": "alt-spring-1-2",
        "text": "@Entity",
        "isCorrect": false
      },
      {
        "id": "alt-spring-1-3",
        "text": "@Bean",
        "isCorrect": false
      },
      {
        "id": "alt-spring-1-4",
        "text": "@Repository",
        "isCorrect": false
      }
    ],
    "explanation": "@Service é uma especialização estereotipada de @Component para sinalizar classes de serviço de negócio."
  },
  {
    "id": "q-springboot-02",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-di"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual é a forma de injeção de dependência mais recomendada pela equipe do Spring, pois facilita testes unitários e garante a imutabilidade dos componentes injetados?",
    "alternatives": [
      {
        "id": "alt-spring-2-1",
        "text": "Injeção via construtor (Constructor Injection).",
        "isCorrect": true
      },
      {
        "id": "alt-spring-2-2",
        "text": "Injeção de campo utilizando a anotação @Autowired diretamente no atributo.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-2-3",
        "text": "Injeção via setter (Setter Injection).",
        "isCorrect": false
      },
      {
        "id": "alt-spring-2-4",
        "text": "Injeção dinâmica em tempo de execução via Reflection API sem anotações.",
        "isCorrect": false
      }
    ],
    "explanation": "Constructor Injection é a prática recomendada porque força dependências requeridas a serem passadas na criação do objeto, viabilizando imutabilidade (final) e facilitando mocks em testes."
  },
  {
    "id": "q-springboot-03",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-di"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Se você tiver duas implementações da mesma interface registradas como beans do Spring, como você pode especificar qual bean deve ser injetado por padrão em um determinado ponto de injeção?",
    "alternatives": [
      {
        "id": "alt-spring-3-1",
        "text": "Usando a anotação @Qualifier combinada com o @Autowired.",
        "isCorrect": true
      },
      {
        "id": "alt-spring-3-2",
        "text": "Alterando o nome da classe para começar com a letra A.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-3-3",
        "text": "Anotando ambas as classes com @Primary ao mesmo tempo.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-3-4",
        "text": "Usando o atributo @Autowired(injectRequired = true).",
        "isCorrect": false
      }
    ],
    "explanation": "@Qualifier resolve ambiguidade informando qual nome do bean deve ser injetado."
  },
  {
    "id": "q-springboot-04",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-jpa"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual é o principal perigo de performance ao usar o padrão de carregamento Lazy em mapeamentos de coleções bidirecionais (@OneToMany) no Spring Data JPA ao iterar sobre uma lista de entidades pai?",
    "alternatives": [
      {
        "id": "alt-spring-4-1",
        "text": "O problema de consultas N+1 (N+1 Selects Problem).",
        "isCorrect": true
      },
      {
        "id": "alt-spring-4-2",
        "text": "O erro ClassNotFoundException da biblioteca Hibernate.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-4-3",
        "text": "O estouro da pilha de execução por loop infinito (StackOverflow).",
        "isCorrect": false
      },
      {
        "id": "alt-spring-4-4",
        "text": "A perda permanente dos registros no banco de dados durante a leitura.",
        "isCorrect": false
      }
    ],
    "explanation": "Ao ler uma lista de tamanho N, cada iteração em uma propriedade lazy gera uma consulta extra no banco, totalizando N+1 queries. O ideal é usar JOIN FETCH ou EntityGraph."
  },
  {
    "id": "q-springboot-05",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-jpa"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "A anotação `@Transactional` do Spring gerencia transações de banco de dados de forma declarativa. O que acontece com a transação se uma exceção do tipo `RuntimeException` (unchecked) for lançada dentro do método anotado?",
    "alternatives": [
      {
        "id": "alt-spring-5-1",
        "text": "A transação é desfeita (rollback) automaticamente pelo Spring.",
        "isCorrect": true
      },
      {
        "id": "alt-spring-5-2",
        "text": "A transação é confirmada (commit) mesmo assim.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-5-3",
        "text": "O Spring congela o banco de dados até a confirmação manual do operador.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-5-4",
        "text": "A exceção é suprimida e o método tenta executar novamente.",
        "isCorrect": false
      }
    ],
    "explanation": "Por padrão, o Spring efetua rollback apenas para RuntimeException e Error. Para exceções checadas (checked), é necessário configurar rollbackFor."
  },
  {
    "id": "q-springboot-06",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-jpa"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Considere o isolamento de transações. No Spring, o que significa configurar uma transação com isolamento `Isolation.READ_COMMITTED`?",
    "alternatives": [
      {
        "id": "alt-spring-6-1",
        "text": "Impede leituras sujas (dirty reads), de forma que uma transação só consegue ler dados confirmados por outras transações.",
        "isCorrect": true
      },
      {
        "id": "alt-spring-6-2",
        "text": "Impede totalmente leituras repetíveis (non-repeatable reads).",
        "isCorrect": false
      },
      {
        "id": "alt-spring-6-3",
        "text": "Torna as transações estritamente sequenciais no banco.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-6-4",
        "text": "Permite ler transações que ainda não foram confirmadas (dirty reads).",
        "isCorrect": false
      }
    ],
    "explanation": "READ_COMMITTED evita Dirty Reads (ler rascunhos de transações paralelas), mas ainda permite leituras não repetíveis e leituras fantasmas."
  },
  {
    "id": "q-springboot-07",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-rest"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual anotação do Spring Web MVC mapeia uma requisição HTTP POST para um método de controle específico?",
    "alternatives": [
      {
        "id": "alt-spring-7-1",
        "text": "@PostMapping",
        "isCorrect": true
      },
      {
        "id": "alt-spring-7-2",
        "text": "@GetMapping",
        "isCorrect": false
      },
      {
        "id": "alt-spring-7-3",
        "text": "@PutMapping",
        "isCorrect": false
      },
      {
        "id": "alt-spring-7-4",
        "text": "@RequestMapping(method = RequestMethod.PATCH)",
        "isCorrect": false
      }
    ],
    "explanation": "@PostMapping é um atalho direto para requisições HTTP POST."
  },
  {
    "id": "q-springboot-08",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-rest"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Como podemos capturar e manipular exceções lançadas por qualquer Controller em um projeto Spring Boot de forma global e centralizada?",
    "alternatives": [
      {
        "id": "alt-spring-8-1",
        "text": "Criar uma classe anotada com @RestControllerAdvice e métodos com @ExceptionHandler.",
        "isCorrect": true
      },
      {
        "id": "alt-spring-8-2",
        "text": "Envolver todo o código de todos os métodos em blocos try-catch.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-8-3",
        "text": "Configurar um filtro HTTP clássico no arquivo web.xml.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-8-4",
        "text": "Modificar a classe Main do Spring Boot para capturar exceções da thread.",
        "isCorrect": false
      }
    ],
    "explanation": "@RestControllerAdvice permite interceptar exceções globais em controllers e retornar respostas HTTP personalizadas com facilidade."
  },
  {
    "id": "q-springboot-09",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-rest"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Em uma API desenvolvida com Spring Boot, qual classe representa a resposta HTTP completa, incluindo código de status, cabeçalhos (headers) e corpo da resposta?",
    "alternatives": [
      {
        "id": "alt-spring-9-1",
        "text": "ResponseEntity<T>",
        "isCorrect": true
      },
      {
        "id": "alt-spring-9-2",
        "text": "HttpServletResponse",
        "isCorrect": false
      },
      {
        "id": "alt-spring-9-3",
        "text": "ModelAndView",
        "isCorrect": false
      },
      {
        "id": "alt-spring-9-4",
        "text": "ResponseBody",
        "isCorrect": false
      }
    ],
    "explanation": "ResponseEntity é o wrapper genérico oficial do Spring para representar respostas HTTP customizadas de maneira controlada."
  },
  {
    "id": "q-springboot-10",
    "themeId": "theme-springboot",
    "competencyIds": [
      "comp-springboot-rest"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "No ecossistema Spring Security, qual é a principal responsabilidade do componente `SecurityContextHolder`?",
    "alternatives": [
      {
        "id": "alt-spring-10-1",
        "text": "Armazenar os detalhes do usuário atualmente autenticado e associá-lo à thread de execução atual.",
        "isCorrect": true
      },
      {
        "id": "alt-spring-10-2",
        "text": "Salvar as senhas criptografadas no banco de dados corporativo.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-10-3",
        "text": "Gerenciar sessões JWT e invalidar tokens expirados automaticamente.",
        "isCorrect": false
      },
      {
        "id": "alt-spring-10-4",
        "text": "Autenticar conexões TLS na camada de transporte do servidor Web.",
        "isCorrect": false
      }
    ],
    "explanation": "SecurityContextHolder armazena os detalhes da thread atual (normalmente associada via ThreadLocal) contendo o contexto de autenticação do usuário logado."
  },
  {
    "id": "q-oracleplsql-01",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual instrução SQL básica é utilizada para extrair linhas exclusivas (sem duplicatas) de uma tabela Oracle?",
    "alternatives": [
      {
        "id": "alt-plsql-1-1",
        "text": "SELECT DISTINCT",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-1-2",
        "text": "SELECT UNIQUE ROWS",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-1-3",
        "text": "SELECT UNIQUE",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-1-4",
        "text": "SELECT EXCEPT DUPLICATES",
        "isCorrect": false
      }
    ],
    "explanation": "SELECT DISTINCT elimina duplicidade nos resultados de uma consulta SQL."
  },
  {
    "id": "q-oracleplsql-02",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Considere duas tabelas: `CLIENTES` e `PEDIDOS`. Para obter todos os clientes, inclusive aqueles que não possuem nenhum pedido relacionado, qual junção (Join) SQL deve ser utilizada?",
    "alternatives": [
      {
        "id": "alt-plsql-2-1",
        "text": "LEFT OUTER JOIN",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-2-2",
        "text": "INNER JOIN",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-2-3",
        "text": "CROSS JOIN",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-2-4",
        "text": "NATURAL JOIN",
        "isCorrect": false
      }
    ],
    "explanation": "LEFT OUTER JOIN preserva todas as linhas da tabela à esquerda, complementando com nulos na direita se não houver correlação."
  },
  {
    "id": "q-oracleplsql-03",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual cláusula da consulta SQL é utilizada para filtrar registros agrupados formados pela cláusula `GROUP BY`?",
    "alternatives": [
      {
        "id": "alt-plsql-3-1",
        "text": "HAVING",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-3-2",
        "text": "WHERE",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-3-3",
        "text": "ORDER BY",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-3-4",
        "text": "OVER",
        "isCorrect": false
      }
    ],
    "explanation": "WHERE filtra linhas individuais antes do agrupamento. HAVING filtra os grupos criados pela agregação."
  },
  {
    "id": "q-oracleplsql-04",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Considere a necessidade de ranquear registros em grupos usando SQL analítico. Qual função analítica atribui classificações sequenciais sem pular números em caso de empates de valores?",
    "alternatives": [
      {
        "id": "alt-plsql-4-1",
        "text": "DENSE_RANK()",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-4-2",
        "text": "RANK()",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-4-3",
        "text": "ROW_NUMBER()",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-4-4",
        "text": "LAG()",
        "isCorrect": false
      }
    ],
    "explanation": "DENSE_RANK() ranqueia valores sem pular numeração (ex: 1, 2, 2, 3). O RANK() convencional pularia (1, 2, 2, 4)."
  },
  {
    "id": "q-oracleplsql-05",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "No Oracle, qual a utilidade da função analítica `LEAD`?\n```sql\nSELECT LEAD(salario, 1) OVER (ORDER BY data_admissao) FROM funcionarios;\n```",
    "alternatives": [
      {
        "id": "alt-plsql-5-1",
        "text": "Acessar o valor de um registro na linha subsequente (próxima linha) sem a necessidade de um autorelacionamento.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-5-2",
        "text": "Acessar o valor de um registro na linha anterior.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-5-3",
        "text": "Calcular o salário acumulado até a linha atual.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-5-4",
        "text": "Obter o maior salário da tabela.",
        "isCorrect": false
      }
    ],
    "explanation": "LEAD provê acesso direto a dados da linha à frente (offset). LAG acessa a linha anterior."
  },
  {
    "id": "q-oracleplsql-06",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Em consultas complexas Oracle, qual a utilidade de utilizar a cláusula `WITH` (Common Table Expressions - CTE)?",
    "alternatives": [
      {
        "id": "alt-plsql-6-1",
        "text": "Definir subconsultas nomeadas temporárias, melhorando consideravelmente a legibilidade e reuso de subqueries na mesma consulta.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-6-2",
        "text": "Forçar o banco de dados a criar tabelas físicas no disco.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-6-3",
        "text": "Bloquear tabelas para escrita durante a execução do relatório.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-6-4",
        "text": "Permitir commits automáticos a cada 10 linhas lidas.",
        "isCorrect": false
      }
    ],
    "explanation": "WITH (CTE) define subqueries temporárias reutilizáveis e limpas que facilitam a escrita de queries complexas."
  },
  {
    "id": "q-oracleplsql-07",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-programming"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual bloco anônimo PL/SQL representa a estrutura sintática mínima aceita pelo compilador Oracle?",
    "alternatives": [
      {
        "id": "alt-plsql-7-1",
        "text": "BEGIN NULL; END;",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-7-2",
        "text": "DECLARE BEGIN END;",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-7-3",
        "text": "START NULL; STOP;",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-7-4",
        "text": "CREATE OR REPLACE ANONYMOUS BLOCK;",
        "isCorrect": false
      }
    ],
    "explanation": "A estrutura mínima requer pelo menos BEGIN e END com alguma instrução de execução válida (como NULL;)."
  },
  {
    "id": "q-oracleplsql-08",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-programming"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Como é feita a atribuição de valor a uma variável declarada em um bloco de código PL/SQL?",
    "alternatives": [
      {
        "id": "alt-plsql-8-1",
        "text": "Usando o operador :=",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-8-2",
        "text": "Usando o operador =",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-8-3",
        "text": "Usando a palavra-chave SET",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-8-4",
        "text": "Usando o operador EQUALS",
        "isCorrect": false
      }
    ],
    "explanation": "Em PL/SQL, := é o operador de atribuição de variável, enquanto = é o operador de comparação lógica."
  },
  {
    "id": "q-oracleplsql-09",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-programming"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "O que é um Trigger em banco de dados Oracle PL/SQL?",
    "alternatives": [
      {
        "id": "alt-plsql-9-1",
        "text": "Um bloco PL/SQL nomeado armazenado no banco que é disparado automaticamente em resposta a um evento específico (DML/DDL).",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-9-2",
        "text": "Uma consulta SQL indexada para acelerar a leitura.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-9-3",
        "text": "Um arquivo de log externo contendo auditoria de erros.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-9-4",
        "text": "Uma chave estrangeira que valida a exclusão física.",
        "isCorrect": false
      }
    ],
    "explanation": "Triggers (gatilhos) são rotinas automáticas disparadas mediante eventos de banco de dados como INSERT, UPDATE ou DELETE."
  },
  {
    "id": "q-oracleplsql-10",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-programming"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Considere o seguinte trecho de código PL/SQL:\n```sql\nDECLARE\n   v_nome VARCHAR2(50);\nBEGIN\n   SELECT nome INTO v_nome FROM clientes WHERE id = 999;\nEXCEPTION\n   WHEN NO_DATA_FOUND THEN\n      v_nome := 'Sem Cadastro';\nEND;\n```\nO que acontece se a consulta não retornar nenhuma linha?",
    "alternatives": [
      {
        "id": "alt-plsql-10-1",
        "text": "A exceção NO_DATA_FOUND é capturada e v_nome recebe o valor \"Sem Cadastro\". O bloco encerra normalmente.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-10-2",
        "text": "O bloco lança um erro fatal e interrompe a execução do script SQL.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-10-3",
        "text": "A variável v_nome permanece com valor nulo.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-10-4",
        "text": "O Oracle tenta inserir uma linha fictícia automaticamente.",
        "isCorrect": false
      }
    ],
    "explanation": "O bloco SELECT INTO exige exatamente 1 linha. Se retornar zero, o Oracle dispara NO_DATA_FOUND que é tratada na seção EXCEPTION."
  },
  {
    "id": "q-oracleplsql-11",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-programming"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Qual estrutura do PL/SQL permite encapsular variáveis, constantes, tipos personalizados, procedures e functions em um componente lógico reutilizável e com controle de visibilidade (público/privado)?",
    "alternatives": [
      {
        "id": "alt-plsql-11-1",
        "text": "Package (Pacote)",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-11-2",
        "text": "Procedure Isolada",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-11-3",
        "text": "Function de Linha",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-11-4",
        "text": "Schema Database",
        "isCorrect": false
      }
    ],
    "explanation": "Packages em PL/SQL consistem em especificação (Specification - pública) e corpo (Body - privado), fornecendo encapsulamento e organização modular."
  },
  {
    "id": "q-oracleplsql-12",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-programming"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Qual a principal diferença técnica e de comportamento entre uma Stored Procedure e uma User-Defined Function (UDF) em PL/SQL?",
    "alternatives": [
      {
        "id": "alt-plsql-12-1",
        "text": "Uma Function é obrigada a retornar um valor (através da cláusula RETURN), enquanto uma Procedure não retorna valor diretamente (podendo usar parâmetros OUT).",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-12-2",
        "text": "Uma Procedure pode ser executada dentro de cláusulas SELECT SQL diretamente e Functions não.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-12-3",
        "text": "Functions não permitem declarações de exceções.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-12-4",
        "text": "Procedures são compiladas apenas em tempo de execução, enquanto Functions são pré-compiladas.",
        "isCorrect": false
      }
    ],
    "explanation": "Functions devem retornar um valor obrigatório e podem ser incorporadas em expressões DML/SELECT (se puras). Procedures executam rotinas de alteração."
  },
  {
    "id": "q-oracleplsql-13",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Ao lidar com cursores em PL/SQL, qual comando é obrigatório executar para liberar os recursos de memória consumidos por um cursor explícito aberto?",
    "alternatives": [
      {
        "id": "alt-plsql-13-1",
        "text": "CLOSE cursor_name;",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-13-2",
        "text": "DEALLOCATE cursor_name;",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-13-3",
        "text": "FREE cursor_name;",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-13-4",
        "text": "COMMIT;",
        "isCorrect": false
      }
    ],
    "explanation": "Fechar o cursor com CLOSE libera a área de memória associada a ele (Private SQL Area)."
  },
  {
    "id": "q-oracleplsql-14",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual erro clássico de desenvolvimento PL/SQL acontece ao tentar ler ou alterar a mesma tabela que disparou um Trigger DML do tipo \"FOR EACH ROW\"?",
    "alternatives": [
      {
        "id": "alt-plsql-14-1",
        "text": "Tabela Mutante (Mutating Table - ORA-04091).",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-14-2",
        "text": "Deadlock de Banco (ORA-00060).",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-14-3",
        "text": "Estouro de Cursor (ORA-01000).",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-14-4",
        "text": "Acesso Não Autorizado (ORA-01031).",
        "isCorrect": false
      }
    ],
    "explanation": "ORA-04091 ocorre quando um trigger de linha tenta consultar ou alterar a própria tabela que disparou o gatilho, indicando inconsistência temporária."
  },
  {
    "id": "q-oracleplsql-15",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Como podemos reduzir o overhead de transição de contexto (Context Switch) entre a engine SQL e a engine PL/SQL ao processar grandes coleções de dados?",
    "alternatives": [
      {
        "id": "alt-plsql-15-1",
        "text": "Utilizar processamento em lote com a cláusula BULK COLLECT e FORALL.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-15-2",
        "text": "Utilizar comandos DML diretos sem blocos BEGIN-END.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-15-3",
        "text": "Substituir todas as consultas por views estáticas.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-15-4",
        "text": "Aumentar o tamanho do tablespace temporário da sessão.",
        "isCorrect": false
      }
    ],
    "explanation": "BULK COLLECT (leitura) e FORALL (escrita) carregam dados em arrays de memória minimizando as trocas de contexto cara entre SQL e PL/SQL engines."
  },
  {
    "id": "q-oracleplsql-16",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "O que é o comando `EXPLAIN PLAN` no banco de dados Oracle?",
    "alternatives": [
      {
        "id": "alt-plsql-16-1",
        "text": "Uma ferramenta que analisa a query e exibe o plano de execução planejado pelo Otimizador de Consultas.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-16-2",
        "text": "Um comando que força a criação automática de índices secundários.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-16-3",
        "text": "Um gerador de relatórios estatísticos de uso de CPU.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-16-4",
        "text": "Uma rotina de backup lógico de tabelas críticas.",
        "isCorrect": false
      }
    ],
    "explanation": "EXPLAIN PLAN gera e insere na PLAN_TABLE os passos que o otimizador Oracle seguirá para resolver a consulta (Full Table Scan, Index Scan, etc)."
  },
  {
    "id": "q-oracleplsql-17",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Ao otimizar uma query no Oracle, qual a principal diferença de estratégia de acesso a dados entre um \"Index Range Scan\" e um \"Index Unique Scan\"?",
    "alternatives": [
      {
        "id": "alt-plsql-17-1",
        "text": "Index Unique Scan localiza exatamente uma única linha (chaves PK/Unique). Index Range Scan lê um intervalo de registros correspondentes.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-17-2",
        "text": "Index Unique Scan lê todas as colunas do índice de ponta a ponta sem chaves.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-17-3",
        "text": "Index Range Scan só funciona para colunas com valores nulos.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-17-4",
        "text": "Index Unique Scan exige a leitura física de todas as partições do disco.",
        "isCorrect": false
      }
    ],
    "explanation": "Unique Scan busca chave exclusiva gerando apenas uma correspondência. Range Scan busca valores ordenados em intervalo (ex: idade > 18)."
  },
  {
    "id": "q-oracleplsql-18",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "O otimizador de consultas do Oracle (Optimizer) utiliza estatísticas da tabela para traçar o plano mais rápido. Qual pacote nativo deve ser executado periodicamente para atualizar as estatísticas de tabelas e índices?",
    "alternatives": [
      {
        "id": "alt-plsql-18-1",
        "text": "DBMS_STATS",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-18-2",
        "text": "DBMS_UTILITY",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-18-3",
        "text": "DBMS_METADATA",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-18-4",
        "text": "DBMS_PROFILER",
        "isCorrect": false
      }
    ],
    "explanation": "DBMS_STATS.GATHER_TABLE_STATS ou GATHER_SCHEMA_STATS atualiza dados estatísticos sobre cardinalidade e distribuição, fundamentais para o Cost-Based Optimizer (CBO)."
  },
  {
    "id": "q-oracleplsql-19",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-tuning"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "O que caracteriza a ocorrência de um cursor compartilhado (\"Hard Parse\") no Oracle Database e por que deve ser evitado?",
    "alternatives": [
      {
        "id": "alt-plsql-19-1",
        "text": "É o processo onde o otimizador precisa compilar do zero um novo plano de execução, ocorrendo quando não são usadas bind variables.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-19-2",
        "text": "É o congelamento permanente da área Shared Pool.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-19-3",
        "text": "É um erro sintático em rotinas de triggers assíncronas.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-19-4",
        "text": "É a leitura em paralelo efetuada por multiplas instâncias RAC.",
        "isCorrect": false
      }
    ],
    "explanation": "O Hard Parse ocorre quando queries diferem no texto (ex: WHERE id = 1 vs id = 2) exigindo nova compilação. O uso de Bind Variables (:id) gera Soft Parses reutilizando planos."
  },
  {
    "id": "q-oracleplsql-20",
    "themeId": "theme-oracleplsql",
    "competencyIds": [
      "comp-plsql-queries"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Qual das seguintes afirmações sobre tabelas globais temporárias (`GLOBAL TEMPORARY TABLES` - GTT) no Oracle é correta?",
    "alternatives": [
      {
        "id": "alt-plsql-20-1",
        "text": "A definição da tabela (metadados) é estática e visível para todas as sessões, mas os dados inseridos são privados de cada sessão.",
        "isCorrect": true
      },
      {
        "id": "alt-plsql-20-2",
        "text": "Os dados inseridos por uma sessão ficam gravados fisicamente de forma definitiva.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-20-3",
        "text": "Uma transação não pode fazer rollback de alterações em tabelas temporárias.",
        "isCorrect": false
      },
      {
        "id": "alt-plsql-20-4",
        "text": "As tabelas temporárias geram mais locks em produção que as tabelas tradicionais.",
        "isCorrect": false
      }
    ],
    "explanation": "Em GTTs no Oracle, a estrutura é pública, mas os dados são totalmente privados e isolados por sessão, sumindo ao fim da transação ou da sessão."
  },
  {
    "id": "q-python-01",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-syntax"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Considere a seguinte linha de código em Python:\n```python\nvalores = [x ** 2 for x in range(5) if x % 2 == 0]\n```\nQual é o valor contido na lista `valores` após a execução?",
    "alternatives": [
      {
        "id": "alt-py-1-1",
        "text": "[0, 4, 16]",
        "isCorrect": true
      },
      {
        "id": "alt-py-1-2",
        "text": "[0, 1, 4, 9, 16]",
        "isCorrect": false
      },
      {
        "id": "alt-py-1-3",
        "text": "[4, 16]",
        "isCorrect": false
      },
      {
        "id": "alt-py-1-4",
        "text": "[0, 2, 4]",
        "isCorrect": false
      }
    ],
    "explanation": "A List Comprehension filtra números pares de 0 a 4 (0, 2, 4) e eleva cada um ao quadrado, resultando em [0, 4, 16]."
  },
  {
    "id": "q-python-02",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-syntax"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Deseja-se criar um dicionário a partir de duas listas de mesmo tamanho: `chaves = ['id', 'nome']` e `valores = [10, 'Ana']`. Qual é a forma mais idiomática (\"pythônica\") de realizar essa operação?",
    "alternatives": [
      {
        "id": "alt-py-2-1",
        "text": "dict(zip(chaves, valores))",
        "isCorrect": true
      },
      {
        "id": "alt-py-2-2",
        "text": "d = {}; [d.update({chaves[i]: valores[i]}) for i in range(len(chaves))]",
        "isCorrect": false
      },
      {
        "id": "alt-py-2-3",
        "text": "dict(chaves + valores)",
        "isCorrect": false
      },
      {
        "id": "alt-py-2-4",
        "text": "{chaves: valores}",
        "isCorrect": false
      }
    ],
    "explanation": "zip() combina os elementos em tuplas emparelhadas, e dict() aceita essa sequência para instanciar o dicionário."
  },
  {
    "id": "q-python-03",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-syntax"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Sobre as estruturas de dados nativas do Python, qual a principal diferença de comportamento e restrições entre uma lista (`list`) e um conjunto (`set`)?",
    "alternatives": [
      {
        "id": "alt-py-3-1",
        "text": "Listas mantêm a ordem de inserção e permitem duplicidade. Conjuntos não garantem ordem física, não contêm elementos duplicados e exigem chaves hashable.",
        "isCorrect": true
      },
      {
        "id": "alt-py-3-2",
        "text": "Conjuntos aceitam listas em seu interior, enquanto listas não aceitam conjuntos.",
        "isCorrect": false
      },
      {
        "id": "alt-py-3-3",
        "text": "Conjuntos são imutáveis após a criação e listas são mutáveis.",
        "isCorrect": false
      },
      {
        "id": "alt-py-3-4",
        "text": "Não há diferença técnica, são sinônimos de tipos.",
        "isCorrect": false
      }
    ],
    "explanation": "Sets são coleções não ordenadas de elementos únicos com busca O(1) devido à tabela hash. Somente tipos hashable (como strings, ints, tuplas) podem ser inseridos."
  },
  {
    "id": "q-python-04",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-functional"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "O que é um gerador (Generator) em Python e como ele otimiza o consumo de memória ao lidar com sequências volumosas de dados?",
    "alternatives": [
      {
        "id": "alt-py-4-1",
        "text": "É uma função que utiliza a palavra-chave yield para retornar valores sob demanda (lazy evaluation), sem alocar a coleção inteira na memória.",
        "isCorrect": true
      },
      {
        "id": "alt-py-4-2",
        "text": "É um compilador JIT integrado ao interpretador CPython.",
        "isCorrect": false
      },
      {
        "id": "alt-py-4-3",
        "text": "É um script externo que pré-processa arquivos de dados csv.",
        "isCorrect": false
      },
      {
        "id": "alt-py-4-4",
        "text": "Uma classe que duplica processos na CPU.",
        "isCorrect": false
      }
    ],
    "explanation": "Ao usar yield, a função vira um gerador. Ela suspende seu estado e retorna valores individualmente conforme solicitado pelo iterador."
  },
  {
    "id": "q-python-05",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-functional"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Considere o seguinte decorador simples escrito em Python:\n```python\ndef decorador(func):\n    def wrapper(*args, **kwargs):\n        print(\"Antes\")\n        resultado = func(*args, **kwargs)\n        print(\"Depois\")\n        return resultado\n    return wrapper\n```\nO que o uso dos argumentos `*args` e `**kwargs` garante à função wrapper?",
    "alternatives": [
      {
        "id": "alt-py-5-1",
        "text": "Permite que o decorador receba e repasse qualquer quantidade de argumentos posicionais e nomeados para a função decorada.",
        "isCorrect": true
      },
      {
        "id": "alt-py-5-2",
        "text": "Força o Python a rodar a função decorada em multithreading.",
        "isCorrect": false
      },
      {
        "id": "alt-py-5-3",
        "text": "Garante que os parâmetros sejam convertidos em tipos imutáveis.",
        "isCorrect": false
      },
      {
        "id": "alt-py-5-4",
        "text": "Cancela a execução se os argumentos forem nulos.",
        "isCorrect": false
      }
    ],
    "explanation": "*args captura argumentos posicionais extras como tupla e **kwargs captura argumentos nomeados como dicionário, provendo máxima flexibilidade."
  },
  {
    "id": "q-python-06",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-functional"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Em Python, a herança múltipla é resolvida através de um algoritmo específico conhecido como MRO (Method Resolution Order). Qual algoritmo é utilizado a partir do Python 3 para definir essa ordem de busca?",
    "alternatives": [
      {
        "id": "alt-py-6-1",
        "text": "C3 Linearization",
        "isCorrect": true
      },
      {
        "id": "alt-py-6-2",
        "text": "Dijkstra Shortest Path",
        "isCorrect": false
      },
      {
        "id": "alt-py-6-3",
        "text": "Depth-First Search linear clássico",
        "isCorrect": false
      },
      {
        "id": "alt-py-6-4",
        "text": "Breadth-First Search puro com cache",
        "isCorrect": false
      }
    ],
    "explanation": "O Python usa o algoritmo C3 Linearization para calcular o MRO de classes com herança múltipla, respeitando monotonicidade e herança local."
  },
  {
    "id": "q-python-07",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-async"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Ao escrever código assíncrono em Python utilizando `asyncio`, qual a diferença conceitual e de execução entre chamar `await corrotina()` e usar `asyncio.create_task(corrotina())`?",
    "alternatives": [
      {
        "id": "alt-py-7-1",
        "text": "await suspende a execução até que a corrotina termine. create_task agenda a execução concorrente da corrotina no Event Loop imediatamente, retornando uma Task.",
        "isCorrect": true
      },
      {
        "id": "alt-py-7-2",
        "text": "create_task cria um novo processo real no sistema operacional.",
        "isCorrect": false
      },
      {
        "id": "alt-py-7-3",
        "text": "Não há diferença, são sinônimos idênticos.",
        "isCorrect": false
      },
      {
        "id": "alt-py-7-4",
        "text": "await só funciona com funções síncronas e create_task não.",
        "isCorrect": false
      }
    ],
    "explanation": "await bloqueia/suspende cooperativamente a corrotina atual. create_task insere a tarefa para rodar em paralelo no event loop de forma assíncrona."
  },
  {
    "id": "q-python-08",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-async"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "O GIL (Global Interpreter Lock) é um mecanismo controverso no CPython. Qual das seguintes afirmações descreve corretamente sua influência em programas multithreaded?",
    "alternatives": [
      {
        "id": "alt-py-8-1",
        "text": "O GIL impede que múltiplas threads executem bytecode Python simultaneamente no mesmo processo, limitando a paralelização real de tarefas CPU-bound.",
        "isCorrect": true
      },
      {
        "id": "alt-py-8-2",
        "text": "O GIL bloqueia chamadas de rede assíncronas do asyncio.",
        "isCorrect": false
      },
      {
        "id": "alt-py-8-3",
        "text": "O GIL é um lock do banco de dados PostgreSQL integrado ao Python.",
        "isCorrect": false
      },
      {
        "id": "alt-py-8-4",
        "text": "O GIL torna threads desnecessárias para processar chamadas de arquivos (I/O-bound).",
        "isCorrect": false
      }
    ],
    "explanation": "O GIL protege o gerenciador de memória do CPython contra acessos concorrentes inseguros. Threads ajudam em tarefas de I/O-bound (esperas de rede/disco), mas não dão ganho de CPU."
  },
  {
    "id": "q-python-09",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-syntax"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual é a palavra-chave usada para tratar exceções em Python de forma a executar um bloco de código SEMPRE, independentemente de ter ocorrido erro ou não?",
    "alternatives": [
      {
        "id": "alt-py-9-1",
        "text": "finally",
        "isCorrect": true
      },
      {
        "id": "alt-py-9-2",
        "text": "except",
        "isCorrect": false
      },
      {
        "id": "alt-py-9-3",
        "text": "else",
        "isCorrect": false
      },
      {
        "id": "alt-py-9-4",
        "text": "always",
        "isCorrect": false
      }
    ],
    "explanation": "O bloco finally é executado de forma garantida após os blocos try/except, útil para fechar arquivos, conexões, etc."
  },
  {
    "id": "q-python-10",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-syntax"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "No gerenciamento de recursos em Python, como o uso da instrução `with open(\"arquivo.txt\") as f:` otimiza a integridade do sistema?",
    "alternatives": [
      {
        "id": "alt-py-10-1",
        "text": "Garante que o arquivo seja fechado automaticamente ao sair do bloco com auxílio do Context Manager, mesmo se ocorrer um erro.",
        "isCorrect": true
      },
      {
        "id": "alt-py-10-2",
        "text": "Criptografa o arquivo no disco rígido.",
        "isCorrect": false
      },
      {
        "id": "alt-py-10-3",
        "text": "Acelera a leitura das linhas dividindo o arquivo em pedaços.",
        "isCorrect": false
      },
      {
        "id": "alt-py-10-4",
        "text": "Evita a necessidade de importar a biblioteca OS.",
        "isCorrect": false
      }
    ],
    "explanation": "A instrução with ativa o protocolo de gerenciador de contexto (__enter__ e __exit__), garantindo a liberação de recursos nativos (como file descriptors)."
  },
  {
    "id": "q-python-11",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-functional"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "O que acontece ao tentar modificar uma variável global de dentro de uma função sem declará-la com a palavra-chave `global` em Python?",
    "alternatives": [
      {
        "id": "alt-py-11-1",
        "text": "O Python cria uma nova variável local com o mesmo nome dentro do escopo da função, deixando a variável global intacta.",
        "isCorrect": true
      },
      {
        "id": "alt-py-11-2",
        "text": "O programa fecha imediatamente com erro de compilação.",
        "isCorrect": false
      },
      {
        "id": "alt-py-11-3",
        "text": "A variável global é alterada com sucesso.",
        "isCorrect": false
      },
      {
        "id": "alt-py-11-4",
        "text": "A variável é movida para uma classe estática.",
        "isCorrect": false
      }
    ],
    "explanation": "Sem a palavra-chave global (ou nonlocal), atribuições a variáveis de escopo externo criam variáveis locais correspondentes por padrão."
  },
  {
    "id": "q-python-12",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-functional"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Qual a diferença entre uma cópia rasa (shallow copy) e uma cópia profunda (deep copy) obtidas pelo módulo `copy` do Python?",
    "alternatives": [
      {
        "id": "alt-py-12-1",
        "text": "A cópia rasa duplica apenas o container de primeiro nível, compartilhando referências de objetos aninhados. A profunda duplica recursivamente tudo.",
        "isCorrect": true
      },
      {
        "id": "alt-py-12-2",
        "text": "A rasa remove as chaves nulas do objeto original.",
        "isCorrect": false
      },
      {
        "id": "alt-py-12-3",
        "text": "A profunda só funciona para dicionários indexados.",
        "isCorrect": false
      },
      {
        "id": "alt-py-12-4",
        "text": "A cópia profunda é efetuada no banco de dados e a rasa na memória.",
        "isCorrect": false
      }
    ],
    "explanation": "Shallow copy copia a estrutura externa, mas objetos compostos aninhados apontam para as mesmas referências na memória. Deep copy clona tudo."
  },
  {
    "id": "q-python-13",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-async"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Em Python assíncrono, qual exceção é gerada quando um Event Loop tenta rodar uma operação de I/O em uma thread de trabalho paralela e a tarefa excede o tempo limite configurado?",
    "alternatives": [
      {
        "id": "alt-py-13-1",
        "text": "asyncio.TimeoutError",
        "isCorrect": true
      },
      {
        "id": "alt-py-13-2",
        "text": "ConnectionRefusedError",
        "isCorrect": false
      },
      {
        "id": "alt-py-13-3",
        "text": "RuntimeError",
        "isCorrect": false
      },
      {
        "id": "alt-py-13-4",
        "text": "KeyboardInterrupt",
        "isCorrect": false
      }
    ],
    "explanation": "Operações embrulhadas em asyncio.wait_for lançam asyncio.TimeoutError se estourarem o tempo configurado."
  },
  {
    "id": "q-python-14",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-syntax"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual método de string em Python retorna True se todos os caracteres da string forem numéricos e houver pelo menos um caractere?",
    "alternatives": [
      {
        "id": "alt-py-14-1",
        "text": "isnumeric()",
        "isCorrect": true
      },
      {
        "id": "alt-py-14-2",
        "text": "isdigit()",
        "isCorrect": false
      },
      {
        "id": "alt-py-14-3",
        "text": "isalnum()",
        "isCorrect": false
      },
      {
        "id": "alt-py-14-4",
        "text": "isalpha()",
        "isCorrect": false
      }
    ],
    "explanation": "isnumeric() retorna True se todos os caracteres forem numéricos (inclusive frações ou caracteres Unicode numéricos)."
  },
  {
    "id": "q-python-15",
    "themeId": "theme-python",
    "competencyIds": [
      "comp-python-functional"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Em Python, o que são Dunder Methods (Double Underscore Methods) e qual sua utilidade primária?",
    "alternatives": [
      {
        "id": "alt-py-15-1",
        "text": "Métodos especiais (como __init__, __str__, __len__) que permitem sobrecarregar operadores nativos e interceptar comportamentos de classes.",
        "isCorrect": true
      },
      {
        "id": "alt-py-15-2",
        "text": "Funções secretas para otimizar processamento matemático na CPU.",
        "isCorrect": false
      },
      {
        "id": "alt-py-15-3",
        "text": "Métodos que só podem ser executados por administradores do sistema.",
        "isCorrect": false
      },
      {
        "id": "alt-py-15-4",
        "text": "Funções de criptografia da biblioteca hash/salts.",
        "isCorrect": false
      }
    ],
    "explanation": "Também chamados de Magic Methods, eles definem como os objetos interagem com operadores embutidos, como len(obj) chamando __len__."
  },
  {
    "id": "q-fastapi-01",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-core"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual biblioteca de validação de dados o FastAPI utiliza por baixo dos panos para definir schemas de requisição e validar dados de entrada?",
    "alternatives": [
      {
        "id": "alt-fa-1-1",
        "text": "Pydantic",
        "isCorrect": true
      },
      {
        "id": "alt-fa-1-2",
        "text": "Marshmallow",
        "isCorrect": false
      },
      {
        "id": "alt-fa-1-3",
        "text": "SQLAlchemy",
        "isCorrect": false
      },
      {
        "id": "alt-fa-1-4",
        "text": "Cerberus",
        "isCorrect": false
      }
    ],
    "explanation": "O FastAPI é fortemente baseado em tipos do Python e usa Pydantic para estruturação e validação automática de dados."
  },
  {
    "id": "q-fastapi-02",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-core"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Como você define um parâmetro de rota (Path Parameter) e um parâmetro de busca (Query Parameter) em uma função de rota no FastAPI?",
    "alternatives": [
      {
        "id": "alt-fa-2-1",
        "text": "Parâmetros na string da rota delimitados por chaves {} são de rota. Demais parâmetros na assinatura da função que são tipos primitivos viram query parameters automaticamente.",
        "isCorrect": true
      },
      {
        "id": "alt-fa-2-2",
        "text": "Todos os parâmetros obrigatoriamente precisam do prefixo @query.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-2-3",
        "text": "O FastAPI só aceita parâmetros enviados no corpo em formato JSON.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-2-4",
        "text": "Não há diferença sintática e ambos são armazenados em arquivos temporários.",
        "isCorrect": false
      }
    ],
    "explanation": "FastAPI inspeciona a rota (ex: /itens/{item_id}) e a função correspondente para separar dinamicamente Path de Query parameters."
  },
  {
    "id": "q-fastapi-03",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-core"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "O FastAPI gera automaticamente documentações interativas da API baseadas na especificação OpenAPI. Quais são os dois endpoints padrão disponibilizados para visualizar essa documentação?",
    "alternatives": [
      {
        "id": "alt-fa-3-1",
        "text": "/docs (Swagger UI) e /redoc (ReDoc)",
        "isCorrect": true
      },
      {
        "id": "alt-fa-3-2",
        "text": "/swagger e /openapi.json",
        "isCorrect": false
      },
      {
        "id": "alt-fa-3-3",
        "text": "/api-docs e /swagger-ui",
        "isCorrect": false
      },
      {
        "id": "alt-fa-3-4",
        "text": "/help e /endpoints",
        "isCorrect": false
      }
    ],
    "explanation": "O FastAPI gera por padrão duas UIs de documentação: Swagger UI (/docs) e ReDoc (/redoc)."
  },
  {
    "id": "q-fastapi-04",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-core"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Para lançar uma resposta de erro HTTP específica (ex: 404 Not Found ou 400 Bad Request) de dentro de uma rota no FastAPI, qual exceção deve ser levantada?",
    "alternatives": [
      {
        "id": "alt-fa-4-1",
        "text": "fastapi.HTTPException",
        "isCorrect": true
      },
      {
        "id": "alt-fa-4-2",
        "text": "ValueError",
        "isCorrect": false
      },
      {
        "id": "alt-fa-4-3",
        "text": "http.client.HTTPError",
        "isCorrect": false
      },
      {
        "id": "alt-fa-4-4",
        "text": "werkzeug.exceptions.NotFound",
        "isCorrect": false
      }
    ],
    "explanation": "O FastAPI fornece a classe fastapi.HTTPException que aceita status_code e detail, traduzindo para respostas JSON adequadas."
  },
  {
    "id": "q-fastapi-05",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-core"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Ao definir um schema Pydantic no FastAPI, qual campo é usado para definir metadados como valores de exemplo, descrições detalhadas e restrições de limite numérico?",
    "alternatives": [
      {
        "id": "alt-fa-5-1",
        "text": "pydantic.Field",
        "isCorrect": true
      },
      {
        "id": "alt-fa-5-2",
        "text": "fastapi.Depends",
        "isCorrect": false
      },
      {
        "id": "alt-fa-5-3",
        "text": "dataclasses.field",
        "isCorrect": false
      },
      {
        "id": "alt-fa-5-4",
        "text": "pydantic.BaseModel.Config",
        "isCorrect": false
      }
    ],
    "explanation": "A classe Field permite configurar validações extras de strings (regex, min_length) e números (gt, lt) além de exemplos e descrições."
  },
  {
    "id": "q-fastapi-06",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-advanced"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Qual a principal finalidade técnica de declarar dependências usando a classe `Depends` nas funções de rota do FastAPI?",
    "alternatives": [
      {
        "id": "alt-fa-6-1",
        "text": "Permitir injeção de dependências modular, promovendo o reuso de lógica como validação de tokens, conexões com banco de dados e carregamento de configurações.",
        "isCorrect": true
      },
      {
        "id": "alt-fa-6-2",
        "text": "Forçar o roteamento a ser assíncrono em 100% das vezes.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-6-3",
        "text": "Limitar a quantidade de conexões simultâneas daquele endpoint.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-6-4",
        "text": "Criptografar as respostas HTTP.",
        "isCorrect": false
      }
    ],
    "explanation": "Depends resolve subdependências complexas recursivamente, gerenciando o ciclo de vida (ex: abrir e fechar conexões DB)."
  },
  {
    "id": "q-fastapi-07",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-advanced"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Considere o uso de funções assíncronas (`async def`) e funções síncronas convencionais (`def`) em rotas do FastAPI. Como o FastAPI gerencia as requisições concorrentes de cada tipo?",
    "alternatives": [
      {
        "id": "alt-fa-7-1",
        "text": "async def roda diretamente no Event Loop (espera cooperativa). Rotas def normais são despachadas para rodar concorrentemente em uma thread pool externa, evitando o bloqueio do Event Loop.",
        "isCorrect": true
      },
      {
        "id": "alt-fa-7-2",
        "text": "Rotas def normais bloqueiam o servidor inteiro até terminarem a execução.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-7-3",
        "text": "Não há diferença prática, ambas rodam na thread principal sequencialmente.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-7-4",
        "text": "O FastAPI só aceita rotas declaradas com async def.",
        "isCorrect": false
      }
    ],
    "explanation": "Para evitar travar o event loop principal em tarefas bloqueantes (ex: conexões DB síncronas), o FastAPI executa rotas de formato síncrono (def) em uma Thread Pool integrada."
  },
  {
    "id": "q-fastapi-08",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-advanced"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Qual servidor ASGI de alta performance é comumente indicado na comunidade para empacotar e servir aplicações FastAPI em ambientes de produção?",
    "alternatives": [
      {
        "id": "alt-fa-8-1",
        "text": "Uvicorn",
        "isCorrect": true
      },
      {
        "id": "alt-fa-8-2",
        "text": "Gunicorn com worker síncrono",
        "isCorrect": false
      },
      {
        "id": "alt-fa-8-3",
        "text": "Apache HTTP Server",
        "isCorrect": false
      },
      {
        "id": "alt-fa-8-4",
        "text": "WSGIRef",
        "isCorrect": false
      }
    ],
    "explanation": "Uvicorn é o servidor ASGI padrão e ultra-rápido usado para executar FastAPI e Starlette."
  },
  {
    "id": "q-fastapi-09",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-core"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Para ler dados JSON do corpo de uma requisição HTTP POST no FastAPI, qual abordagem sintática é recomendada?",
    "alternatives": [
      {
        "id": "alt-fa-9-1",
        "text": "Declarar um parâmetro de rota tipado com uma subclasse de BaseModel do Pydantic.",
        "isCorrect": true
      },
      {
        "id": "alt-fa-9-2",
        "text": "Acessar a variável request.json() manualmente em toda rota.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-9-3",
        "text": "Utilizar a função parser() do Python.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-9-4",
        "text": "Usar variáveis globais de dicionários.",
        "isCorrect": false
      }
    ],
    "explanation": "Ao tipar um argumento de entrada com uma classe baseada em BaseModel, o FastAPI automaticamente realiza o parse do body JSON, valida os tipos e injeta a instância."
  },
  {
    "id": "q-fastapi-10",
    "themeId": "theme-fastapi",
    "competencyIds": [
      "comp-fastapi-advanced"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Como podemos permitir requisições de origens diferentes (CORS) em uma aplicação FastAPI, de forma que o frontend consuma os dados corretamente?",
    "alternatives": [
      {
        "id": "alt-fa-10-1",
        "text": "Adicionando o CORSMiddleware à aplicação através do app.add_middleware().",
        "isCorrect": true
      },
      {
        "id": "alt-fa-10-2",
        "text": "Configurando o cabeçalho no servidor nginx apenas.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-10-3",
        "text": "Instalando uma biblioteca externa no navegador.",
        "isCorrect": false
      },
      {
        "id": "alt-fa-10-4",
        "text": "Removendo todos os cabeçalhos de segurança da API.",
        "isCorrect": false
      }
    ],
    "explanation": "O CORSMiddleware nativo do FastAPI intercepta requisições prévias (options) e injeta os headers Access-Control-Allow-Origin apropriados."
  },
  {
    "id": "q-docker-01",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-images"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual é o comando Docker básico utilizado para compilar uma imagem a partir de instruções contidas em um arquivo `Dockerfile`?",
    "alternatives": [
      {
        "id": "alt-dk-1-1",
        "text": "docker build",
        "isCorrect": true
      },
      {
        "id": "alt-dk-1-2",
        "text": "docker compile",
        "isCorrect": false
      },
      {
        "id": "alt-dk-1-3",
        "text": "docker run",
        "isCorrect": false
      },
      {
        "id": "alt-dk-1-4",
        "text": "docker create-image",
        "isCorrect": false
      }
    ],
    "explanation": "docker build lê o Dockerfile no diretório atual e gera a imagem localmente (ex: docker build -t meu-app .)."
  },
  {
    "id": "q-docker-02",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-images"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Ao escrever instruções em um `Dockerfile`, qual a diferença conceitual e de comportamento entre as instruções `COPY` e `ADD`?",
    "alternatives": [
      {
        "id": "alt-dk-2-1",
        "text": "COPY realiza apenas a cópia local simples de arquivos. ADD permite baixar arquivos de URLs remotas e descompactar arquivos tar automaticamente.",
        "isCorrect": true
      },
      {
        "id": "alt-dk-2-2",
        "text": "ADD é mais moderno e seguro, sendo a recomendação primária para cópias locais.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-2-3",
        "text": "COPY criptografa os arquivos copiados e ADD não.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-2-4",
        "text": "Não há diferença, são aliases exatos.",
        "isCorrect": false
      }
    ],
    "explanation": "A instrução COPY é preferida para cópias locais simples de diretórios. ADD possui recursos extras (extração automática, downloads remotos) que introduzem riscos adicionais."
  },
  {
    "id": "q-docker-03",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-images"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Como funciona o sistema de cache de camadas (layer caching) do Docker durante o build de uma imagem?",
    "alternatives": [
      {
        "id": "alt-dk-3-1",
        "text": "Cada comando gera uma camada. Se o arquivo alterado for copiado em uma instrução intermediária, todas as instruções subsequentes perdem o cache e são reexecutadas.",
        "isCorrect": true
      },
      {
        "id": "alt-dk-3-2",
        "text": "O Docker reconstrói 100% da imagem a cada execução para evitar inconsistências.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-3-3",
        "text": "O cache é baseado apenas nas variáveis de ambiente da máquina local.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-3-4",
        "text": "Somente as instruções EXPOSE e ENV entram em cache.",
        "isCorrect": false
      }
    ],
    "explanation": "Qualquer mudança em arquivos que quebre o hash de uma camada faz com que o Docker recrie aquela instrução e todas as seguintes a partir do zero."
  },
  {
    "id": "q-docker-04",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-images"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual técnica de design de Dockerfile permite reduzir drasticamente o tamanho final de imagens em produção, separando a compilação (SDK pesado) da execução final (JRE/Runtime leve)?",
    "alternatives": [
      {
        "id": "alt-dk-4-1",
        "text": "Multi-stage Builds (Builds de múltiplos estágios).",
        "isCorrect": true
      },
      {
        "id": "alt-dk-4-2",
        "text": "Compactação zip manual dos arquivos.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-4-3",
        "text": "Utilização de imagens base baseadas em CentOS.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-4-4",
        "text": "Utilização do comando docker shrink.",
        "isCorrect": false
      }
    ],
    "explanation": "Multi-stage permite usar uma imagem com compiladores (stage build) e copiar apenas os binários gerados para uma imagem limpa e mínima de execução."
  },
  {
    "id": "q-docker-05",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-images"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Em segurança de containers, por que é altamente recomendável evitar rodar processos de produção sob o usuário `root` padrão dentro do container?",
    "alternatives": [
      {
        "id": "alt-dk-5-1",
        "text": "Se houver uma falha de segurança que permita o escape do container (container breakout), o invasor ganha privilégios administrativos (root) na máquina hospedeira.",
        "isCorrect": true
      },
      {
        "id": "alt-dk-5-2",
        "text": "O kernel Linux encerra processos não-root após 24 horas de execução por economia de energia.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-5-3",
        "text": "Imagens que executam como root duplicam o consumo de memória virtual.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-5-4",
        "text": "O Docker Compose não permite subir mais de um container com root.",
        "isCorrect": false
      }
    ],
    "explanation": "Rodar processos como não-root (USER daemon/nobody) limita a escala de danos caso ocorra exploração de vulnerabilidades no container."
  },
  {
    "id": "q-docker-06",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-compose"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual é a extensão de arquivo e nomenclatura padrão utilizada pelo Docker Compose para gerenciar e configurar serviços locais?",
    "alternatives": [
      {
        "id": "alt-dk-6-1",
        "text": "docker-compose.yml (ou docker-compose.yaml)",
        "isCorrect": true
      },
      {
        "id": "alt-dk-6-2",
        "text": "dockerfile.txt",
        "isCorrect": false
      },
      {
        "id": "alt-dk-6-3",
        "text": "compose.json",
        "isCorrect": false
      },
      {
        "id": "alt-dk-6-4",
        "text": "docker-compose.ini",
        "isCorrect": false
      }
    ],
    "explanation": "Arquivos YAML estruturados configuram serviços, volumes e redes locais."
  },
  {
    "id": "q-docker-07",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-compose"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual comando do Docker Compose é utilizado para baixar imagens pendentes, criar volumes/redes e subir todos os serviços definidos em segundo plano (background)?",
    "alternatives": [
      {
        "id": "alt-dk-7-1",
        "text": "docker-compose up -d",
        "isCorrect": true
      },
      {
        "id": "alt-dk-7-2",
        "text": "docker-compose start",
        "isCorrect": false
      },
      {
        "id": "alt-dk-7-3",
        "text": "docker-compose run --background",
        "isCorrect": false
      },
      {
        "id": "alt-dk-7-4",
        "text": "docker-compose create",
        "isCorrect": false
      }
    ],
    "explanation": "up cria e inicia os containers. A flag -d (detached) roda em background liberando o terminal."
  },
  {
    "id": "q-docker-08",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-compose"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Em um arquivo `docker-compose.yml`, qual o comportamento padrão de uma rede do tipo `bridge` criada automaticamente para o conjunto de serviços?",
    "alternatives": [
      {
        "id": "alt-dk-8-1",
        "text": "Permite que todos os containers definidos no mesmo arquivo se comuniquem por nome de host (DNS interno), mantendo isolamento da rede externa.",
        "isCorrect": true
      },
      {
        "id": "alt-dk-8-2",
        "text": "Expõe automaticamente todos os serviços para a internet pública sem restrições.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-8-3",
        "text": "Bloqueia totalmente o tráfego IP entre containers locais.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-8-4",
        "text": "Redireciona todo o tráfego HTTP para HTTPS criptografado automaticamente.",
        "isCorrect": false
      }
    ],
    "explanation": "A rede padrão criada pelo Compose habilita Service Discovery automático por nome dos serviços definidos."
  },
  {
    "id": "q-docker-09",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-compose"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual a diferença de comportamento entre montar um volume nomeado (`named volume`) e um mapeamento de diretório direto (`bind mount`) no Docker?",
    "alternatives": [
      {
        "id": "alt-dk-9-1",
        "text": "Named volumes são gerenciados diretamente pelo Docker na sua pasta interna de dados. Bind mounts apontam para caminhos específicos arbitrários do host de forma direta.",
        "isCorrect": true
      },
      {
        "id": "alt-dk-9-2",
        "text": "Named volumes deletam os dados ao destruir o container, enquanto bind mounts não.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-9-3",
        "text": "Bind mounts só rodam em sistemas Linux e named volumes apenas em Windows.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-9-4",
        "text": "Não há diferença prática.",
        "isCorrect": false
      }
    ],
    "explanation": "Volumes nomeados são mais seguros para produção porque o Docker os isola. Bind mounts dependem da estrutura de pastas da máquina onde rodam."
  },
  {
    "id": "q-docker-10",
    "themeId": "theme-docker",
    "competencyIds": [
      "comp-docker-compose"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "No Docker Compose, como funciona o mecanismo da instrução `depends_on` para gerenciar a ordem de inicialização de múltiplos serviços que possuem dependências entre si?",
    "alternatives": [
      {
        "id": "alt-dk-10-1",
        "text": "Garante que os containers sejam iniciados na ordem configurada, mas não garante que o processo da aplicação dependente já esteja pronto para aceitar conexões (necessitando de healthcheck adicionais).",
        "isCorrect": true
      },
      {
        "id": "alt-dk-10-2",
        "text": "Bloqueia o container até que a aplicação do outro container responda HTTP 200 automaticamente.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-10-3",
        "text": "Realiza pooling de memória compartilhado entre os serviços declarados.",
        "isCorrect": false
      },
      {
        "id": "alt-dk-10-4",
        "text": "É ignorado pela engine nas versões recentes do docker.",
        "isCorrect": false
      }
    ],
    "explanation": "depends_on dita apenas a ordem de criação do container. Se a aplicação precisa aguardar um DB subir, deve ser configurado depends_on com condition: service_healthy vinculada a um healthcheck."
  },
  {
    "id": "q-kubernetes-01",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-basics"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual é a menor unidade computacional passível de deploy e gerenciamento que podemos criar no Kubernetes, consistindo de um ou mais containers que compartilham armazenamento e rede?",
    "alternatives": [
      {
        "id": "alt-k8s-1-1",
        "text": "Pod",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-1-2",
        "text": "Deployment",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-1-3",
        "text": "Node",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-1-4",
        "text": "Service",
        "isCorrect": false
      }
    ],
    "explanation": "O Pod representa a menor unidade no Kubernetes, contendo containers agrupados de forma coesa (como o app e um sidecar)."
  },
  {
    "id": "q-kubernetes-02",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-basics"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual utilitário de linha de comando oficial é utilizado para gerenciar, aplicar manifestos e diagnosticar problemas no cluster Kubernetes?",
    "alternatives": [
      {
        "id": "alt-k8s-2-1",
        "text": "kubectl",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-2-2",
        "text": "k8s-cli",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-2-3",
        "text": "docker-k8s",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-2-4",
        "text": "kubelet-cli",
        "isCorrect": false
      }
    ],
    "explanation": "kubectl é o binário que interage com a API Server do Kubernetes para gerenciar recursos."
  },
  {
    "id": "q-kubernetes-03",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-basics"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual recurso do Kubernetes é mais indicado para gerenciar atualizações declarativas de Pods sem causar downtime, permitindo estratégias como rolling updates e rollback de versões?",
    "alternatives": [
      {
        "id": "alt-k8s-3-1",
        "text": "Deployment",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-3-2",
        "text": "ReplicaSet",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-3-3",
        "text": "StatefulSet",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-3-4",
        "text": "DaemonSet",
        "isCorrect": false
      }
    ],
    "explanation": "Deployments gerenciam ReplicaSets de forma declarativa, viabilizando escalonamento e atualizações suaves (RollingUpdates)."
  },
  {
    "id": "q-kubernetes-04",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-basics"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Ao definir limites de recursos de CPU em pods do Kubernetes (ex: `cpu: \"200m\"`), o que a unidade \"200m\" representa?",
    "alternatives": [
      {
        "id": "alt-k8s-4-1",
        "text": "200 milicores, ou seja, 20% de uma única thread de CPU (núcleo virtual) alocada.",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-4-2",
        "text": "200 megabytes de memória virtual reservada.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-4-3",
        "text": "200 minutos de processamento contínuo.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-4-4",
        "text": "200 núcleos físicos exclusivos para aquele container.",
        "isCorrect": false
      }
    ],
    "explanation": "m significa milicores. 1000m equivale a 1 core de CPU virtual."
  },
  {
    "id": "q-kubernetes-05",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-basics"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Qual a diferença conceitual fundamental de comportamento entre um `Deployment` e um `StatefulSet` ao lidar com pods replicados e armazenamento persistente?",
    "alternatives": [
      {
        "id": "alt-k8s-5-1",
        "text": "Deployments gerenciam pods stateless com nomes aleatórios e volumes compartilhados intercambiáveis. StatefulSets mantêm identidades de rede fixas e ordenadas (pod-0, pod-1) com volumes exclusivos por réplica.",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-5-2",
        "text": "Deployments são para bancos de dados relacionais e StatefulSets apenas para páginas web estáticas.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-5-3",
        "text": "StatefulSets não suportam atualizações automáticas e exigem a recriação manual do cluster.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-5-4",
        "text": "Não há diferença na camada lógica, apenas no custo financeiro do deploy.",
        "isCorrect": false
      }
    ],
    "explanation": "StatefulSets servem para workloads stateful (como bancos clusterizados ou brokers de mensageria) onde a persistência de identidade e volume individualizado de dados é vital."
  },
  {
    "id": "q-kubernetes-06",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-network"
    ],
    "type": "NORMAL",
    "seniority": "Trainee",
    "text": "Qual recurso de rede do Kubernetes fornece um endereço IP estável e balanceamento de carga básico para expor internamente um grupo de Pods dinâmicos no cluster?",
    "alternatives": [
      {
        "id": "alt-k8s-6-1",
        "text": "Service",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-6-2",
        "text": "IngressRoute",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-6-3",
        "text": "NetworkPolicy",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-6-4",
        "text": "EndpointSlice",
        "isCorrect": false
      }
    ],
    "explanation": "Services criam uma camada de abstração estável mapeando conexões para pods selecionados por labels."
  },
  {
    "id": "q-kubernetes-07",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-network"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual tipo de Service do Kubernetes é utilizado para expor um serviço externamente, alocando uma porta de escuta fixa (normalmente entre 30000 e 32767) em cada nó físico do cluster?",
    "alternatives": [
      {
        "id": "alt-k8s-7-1",
        "text": "NodePort",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-7-2",
        "text": "ClusterIP",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-7-3",
        "text": "ExternalName",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-7-4",
        "text": "LoadBalancer interno",
        "isCorrect": false
      }
    ],
    "explanation": "NodePort abre uma porta específica nos IPs públicos dos nós do cluster, repassando o tráfego para os pods de backend."
  },
  {
    "id": "q-kubernetes-08",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-network"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Como funciona o recurso de Ingress no Kubernetes e qual a sua principal vantagem em relação à criação de múltiplos serviços do tipo LoadBalancer?",
    "alternatives": [
      {
        "id": "alt-k8s-8-1",
        "text": "Ingress atua como roteador HTTP/HTTPS na camada 7, centralizando múltiplos caminhos (paths) ou domínios em um único ponto de entrada IP, economizando no provisionamento de IPs externos.",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-8-2",
        "text": "Ingress criptografa o disco dos pods na nuvem.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-8-3",
        "text": "Ingress impede ataques DDoS desativando o tráfego externo automaticamente.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-8-4",
        "text": "Ingress remove a necessidade de ter controllers de redes no cluster.",
        "isCorrect": false
      }
    ],
    "explanation": "Ingress centraliza regras de roteamento HTTP (ex: api.dominio.com -> svc-api; dominio.com/web -> svc-web) sob um único Ingress Controller."
  },
  {
    "id": "q-kubernetes-09",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-network"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual componente do Control Plane do Kubernetes é responsável por observar Pods recém-criados que ainda não possuem um Node associado, escolhendo o melhor Node físico/virtual para executá-los com base em requisitos e afinidades?",
    "alternatives": [
      {
        "id": "alt-k8s-9-1",
        "text": "kube-scheduler",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-9-2",
        "text": "kube-controller-manager",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-9-3",
        "text": "kube-apiserver",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-9-4",
        "text": "etcd",
        "isCorrect": false
      }
    ],
    "explanation": "O scheduler escolhe o melhor nó disponível analisando requests de memória, tolerations, affinity rules, etc."
  },
  {
    "id": "q-kubernetes-10",
    "themeId": "theme-kubernetes",
    "competencyIds": [
      "comp-k8s-network"
    ],
    "type": "CERTIFICATION",
    "seniority": "Sênior",
    "text": "Em segurança de redes no Kubernetes, como podemos aplicar regras de isolamento a nível IP (camada 3/4) para restringir quais pods podem receber tráfego de entrada e saída (ingress/egress)?",
    "alternatives": [
      {
        "id": "alt-k8s-10-1",
        "text": "Definindo manifestos de NetworkPolicy e garantindo suporte por parte do plugin CNI do cluster.",
        "isCorrect": true
      },
      {
        "id": "alt-k8s-10-2",
        "text": "Alterando as configurações de IPtables de todos os containers manualmente.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-10-3",
        "text": "Habilitando criptografia TLS na camada do Ingress apenas.",
        "isCorrect": false
      },
      {
        "id": "alt-k8s-10-4",
        "text": "Adicionando o link nodeSelector no Deployment.",
        "isCorrect": false
      }
    ],
    "explanation": "NetworkPolicies restringem tráfego IP de Pods por seletores de namespace e labels, necessitando de um CNI adequado (Calico, Cilium) para fazer valer as regras."
  },
  {
    "id": "q-git-01",
    "themeId": "theme-git",
    "competencyIds": [
      "comp-git-basics"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual comando Git é utilizado para obter o histórico detalhado de commits efetuados no repositório local?",
    "alternatives": [
      {
        "id": "alt-git-1-1",
        "text": "git log",
        "isCorrect": true
      },
      {
        "id": "alt-git-1-2",
        "text": "git status",
        "isCorrect": false
      },
      {
        "id": "alt-git-1-3",
        "text": "git history",
        "isCorrect": false
      },
      {
        "id": "alt-git-1-4",
        "text": "git diff",
        "isCorrect": false
      }
    ],
    "explanation": "git log exibe informações completas (SHA, autor, data, mensagem) dos commits em ordem reversa."
  },
  {
    "id": "q-git-02",
    "themeId": "theme-git",
    "competencyIds": [
      "comp-git-basics"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Em fluxos de branching, o que caracteriza a estratégia do \"Trunk-Based Development\" comparada ao \"GitFlow\" clássico?",
    "alternatives": [
      {
        "id": "alt-git-2-1",
        "text": "Desenvolvedores integram pequenas alterações em uma branch principal (\"trunk/main\") frequentemente, reduzindo branches de vida longa e minimizando merge hells.",
        "isCorrect": true
      },
      {
        "id": "alt-git-2-2",
        "text": "Exige branches exclusivas de release, hotfix, develop e master rodando em paralelo durante meses.",
        "isCorrect": false
      },
      {
        "id": "alt-git-2-3",
        "text": "Impede o uso de Pull Requests e revisões de código de equipe.",
        "isCorrect": false
      },
      {
        "id": "alt-git-2-4",
        "text": "Permite compilar código apenas se houver commits assinados com GPG por todos.",
        "isCorrect": false
      }
    ],
    "explanation": "Trunk-Based defende integrações curtas e frequentes na main (normalmente via Feature Flags), evitando merges gigantescos no final de sprints."
  },
  {
    "id": "q-git-03",
    "themeId": "theme-git",
    "competencyIds": [
      "comp-git-advanced"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "Como o Git gerencia e resolve conflitos durante uma operação de merge ou rebase?",
    "alternatives": [
      {
        "id": "alt-git-3-1",
        "text": "O Git insere marcadores especiais (<<<<<<<, =======, >>>>>>>) no arquivo em conflito e interrompe a operação para que o desenvolvedor decida qual versão manter manualmente.",
        "isCorrect": true
      },
      {
        "id": "alt-git-3-2",
        "text": "O Git substitui todos os arquivos locais pela versão remota automaticamente sem aviso.",
        "isCorrect": false
      },
      {
        "id": "alt-git-3-3",
        "text": "O Git joga uma moeda para decidir e continua a operação em lote.",
        "isCorrect": false
      },
      {
        "id": "alt-git-3-4",
        "text": "A operação falha e exclui o histórico de commits locais permanente.",
        "isCorrect": false
      }
    ],
    "explanation": "O Git marca as diferenças textuais dos trechos e trava o merge/rebase até que o desenvolvedor resolva a colisão de linhas, limpe os marcadores e registre o commit de conclusão."
  },
  {
    "id": "q-git-04",
    "themeId": "theme-git",
    "competencyIds": [
      "comp-git-advanced"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Qual a diferença técnica de resultado histórico no histórico de commits ao aplicar `git merge` e `git rebase` para atualizar sua feature branch com dados da branch principal?",
    "alternatives": [
      {
        "id": "alt-git-4-1",
        "text": "merge cria um novo commit de junção (merge commit), preservando o histórico cronológico exato. rebase reescreve o histórico aplicando seus commits no topo da branch de destino, gerando um histórico linear.",
        "isCorrect": true
      },
      {
        "id": "alt-git-4-2",
        "text": "rebase cria novos commits e merge remove commits passados.",
        "isCorrect": false
      },
      {
        "id": "alt-git-4-3",
        "text": "merge reescreve os hashes de todos os commits passados da main.",
        "isCorrect": false
      },
      {
        "id": "alt-git-4-4",
        "text": "Não há diferença no resultado final dos hashes de commits.",
        "isCorrect": false
      }
    ],
    "explanation": "rebase reescreve os hashes locais reaplicando suas modificações a partir do commit mais recente do destino. merge mantém o fluxo ramificado gerando um merge commit."
  },
  {
    "id": "q-git-05",
    "themeId": "theme-git",
    "competencyIds": [
      "comp-git-advanced"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Você acabou de cometer um erro grave rodando um comando reset destrutivo (`git reset --hard HEAD~`) perdendo commits locais ainda não enviados ao servidor. Qual mecanismo interno do Git permite localizar os hashes desses commits \"perdidos\" para recuperá-los?",
    "alternatives": [
      {
        "id": "alt-git-5-1",
        "text": "git reflog",
        "isCorrect": true
      },
      {
        "id": "alt-git-5-2",
        "text": "git revert",
        "isCorrect": false
      },
      {
        "id": "alt-git-5-3",
        "text": "git fsck --lost-found",
        "isCorrect": false
      },
      {
        "id": "alt-git-5-4",
        "text": "git log --all --graph",
        "isCorrect": false
      }
    ],
    "explanation": "O Reflog (Reference Log) monitora todas as alterações feitas nas cabeças locais de branches (checkout, commit, reset, rebase). Ele mantém referências de commits soltos por até 90 dias."
  },
  {
    "id": "q-cleancode-01",
    "themeId": "theme-cleancode",
    "competencyIds": [
      "comp-clean-solid"
    ],
    "type": "NORMAL",
    "seniority": "Júnior",
    "text": "Qual princípio do SOLID indica que uma classe deve estar aberta para extensão, mas fechada para modificação, permitindo incluir novas funcionalidades via herança/polimorfismo sem alterar o código existente?",
    "alternatives": [
      {
        "id": "alt-cl-1-1",
        "text": "Open-Closed Principle (OCP)",
        "isCorrect": true
      },
      {
        "id": "alt-cl-1-2",
        "text": "Single Responsibility Principle (SRP)",
        "isCorrect": false
      },
      {
        "id": "alt-cl-1-3",
        "text": "Liskov Substitution Principle (LSP)",
        "isCorrect": false
      },
      {
        "id": "alt-cl-1-4",
        "text": "Dependency Inversion Principle (DIP)",
        "isCorrect": false
      }
    ],
    "explanation": "OCP incentiva abstrações flexíveis (ex: usar interfaces e polimorfismo) para novos comportamentos, reduzindo o risco de quebrar regras existentes."
  },
  {
    "id": "q-cleancode-02",
    "themeId": "theme-cleancode",
    "competencyIds": [
      "comp-clean-solid"
    ],
    "type": "CERTIFICATION",
    "seniority": "Pleno",
    "text": "Considere o seguinte cenário: Uma classe filha estende uma classe pai e sobrescreve um método de forma que ela lança uma exceção do tipo `UnsupportedOperationException` para um caso de uso específico suportado pelo pai. Qual princípio do SOLID está sendo explicitamente violado?",
    "alternatives": [
      {
        "id": "alt-cl-2-1",
        "text": "Liskov Substitution Principle (LSP)",
        "isCorrect": true
      },
      {
        "id": "alt-cl-2-2",
        "text": "Single Responsibility Principle (SRP)",
        "isCorrect": false
      },
      {
        "id": "alt-cl-2-3",
        "text": "Interface Segregation Principle (ISP)",
        "isCorrect": false
      },
      {
        "id": "alt-cl-2-4",
        "text": "Open-Closed Principle (OCP)",
        "isCorrect": false
      }
    ],
    "explanation": "LSP declara que classes derivadas devem ser substituíveis por suas classes bases sem alterar a corretude do sistema."
  },
  {
    "id": "q-cleancode-03",
    "themeId": "theme-cleancode",
    "competencyIds": [
      "comp-clean-solid"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Qual das seguintes regras exemplifica corretamente a aplicação prática do princípio de Inversão de Dependência (DIP) do SOLID em arquitetura de software?",
    "alternatives": [
      {
        "id": "alt-cl-3-1",
        "text": "Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. Abstrações não devem depender de detalhes; detalhes devem depender de abstrações.",
        "isCorrect": true
      },
      {
        "id": "alt-cl-3-2",
        "text": "Obrigar que todas as dependências sejam configuradas em arquivos JSON dinâmicos lidos em tempo de execução.",
        "isCorrect": false
      },
      {
        "id": "alt-cl-3-3",
        "text": "Desenvolver funções que realizem apenas uma tarefa por vez.",
        "isCorrect": false
      },
      {
        "id": "alt-cl-3-4",
        "text": "Criar interfaces gigantescas com mais de 50 métodos para cobrir todos os serviços do sistema de uma só vez.",
        "isCorrect": false
      }
    ],
    "explanation": "DIP reduz acoplamento injetando contratos (interfaces) ao invés de classes de infraestrutura concretas (ex: Repositório depende de interface, não da conexão MongoDB direta)."
  },
  {
    "id": "q-cleancode-04",
    "themeId": "theme-cleancode",
    "competencyIds": [
      "comp-clean-smells"
    ],
    "type": "NORMAL",
    "seniority": "Pleno",
    "text": "O que caracteriza o Code Smell \"Obsessão Primitiva\" (Primitive Obsession) em desenvolvimento orientado a objetos e qual sua refatoração recomendada?",
    "alternatives": [
      {
        "id": "alt-cl-4-1",
        "text": "O uso excessivo de tipos primitivos (como strings simples para CPF, email, telefone) ao invés de criar pequenos objetos de valor encapsulando validações.",
        "isCorrect": true
      },
      {
        "id": "alt-cl-4-2",
        "text": "A dependência crônica de loops aninhados nas consultas SQL.",
        "isCorrect": false
      },
      {
        "id": "alt-cl-4-3",
        "text": "O ato de comentar excessivamente trechos de códigos simples.",
        "isCorrect": false
      },
      {
        "id": "alt-cl-4-4",
        "text": "Declarar métodos com nomes em outro idioma.",
        "isCorrect": false
      }
    ],
    "explanation": "A criação de Value Objects (objetos de valor como Cpf, Email, Dinheiro) resolve a Obsessão Primitiva centralizando regras de domínio."
  },
  {
    "id": "q-cleancode-05",
    "themeId": "theme-cleancode",
    "competencyIds": [
      "comp-clean-smells"
    ],
    "type": "NORMAL",
    "seniority": "Sênior",
    "text": "Considere o acoplamento temporal (Temporal Coupling) e o vazamento de detalhes de implementação. Como a \"Lei de Demeter\" (Princípio do Menor Conhecimento) nos ajuda a manter a manutenabilidade do código?",
    "alternatives": [
      {
        "id": "alt-cl-5-1",
        "text": "Ela dita que um método de um objeto deve apenas chamar métodos do próprio objeto, de seus parâmetros, de objetos criados por ele ou de seus componentes diretos, evitando encadeamentos longos (ex: carro.getMotor().getValvula().ativar()).",
        "isCorrect": true
      },
      {
        "id": "alt-cl-5-2",
        "text": "Ela exige que todos os métodos da aplicação sejam privados.",
        "isCorrect": false
      },
      {
        "id": "alt-cl-5-3",
        "text": "Ela limita o tempo de compilação da aplicação.",
        "isCorrect": false
      },
      {
        "id": "alt-cl-5-4",
        "text": "Ela incentiva a cópia de métodos comuns para evitar herança.",
        "isCorrect": false
      }
    ],
    "explanation": "Evitar encadeamento (\"conversar apenas com seus amigos próximos\") impede que mudanças internas de classes profundas na cadeia quebrem classes consumidoras distantes."
  }
];
