import { prisma } from '../src/lib/prisma';

async function main() {
  const userId = process.env.TEST_USER_ID || 'id do seu user de test';

  console.log(`Verificando/Criando usuário: ${userId}...`);

  // Garantir que o usuário existe para não dar erro de Foreign Key
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: 'Usuário de Teste',
      email: 'teste@example.com',
      emailVerified: true,
    },
  });

  // Limpar filmes existentes para evitar duplicatas se rodar o seed novamente
  console.log('Limpando filmes existentes...');
  await prisma.movie.deleteMany({
    where: { userId },
  });

  const moviesData = [
    {
      title: 'Bumblebee',
      originalTitle: 'Bumblebee',
      tagline: 'Todo herói tem um começo.',
      overview:
        'Refugiado num ferro-velho na Califórnia, Bumblebee é encontrado e consertado pela jovem Charlie. Quando o revive, ela percebe que este não é um fusca amarelo comum.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/c5e94e35-14c8-4023-ac2a-bb301f1647cc',
      releaseDate: new Date('2018-12-20'),
      runtime: 114,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '12 ANOS',
      voteCount: 5704,
      voteAverage: 67.0,
      budget: BigInt(135000000),
      revenue: BigInt(467989646),
      profit: BigInt(332989646),
      genres: ['Ação', 'Aventura', 'Ficção Científica'],
      userId,
    },
    {
      title: 'Capitã Marvel',
      originalTitle: 'Captain Marvel',
      tagline: 'Mais rápido, mais alto, mais forte.',
      overview:
        'Capitã Marvel acompanha a jornada de Carol Danvers, enquanto ela se torna uma das heroínas mais poderosas do universo, quando a Terra é pega no meio de uma guerra galáctica entre duas raças alienígenas.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/c78942dd-ba85-455c-b3e1-37d55ce57b53',
      releaseDate: new Date('2019-03-07'),
      runtime: 124,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '12 ANOS',
      voteCount: 13000,
      voteAverage: 70.0,
      budget: BigInt(152000000),
      revenue: BigInt(1128000000),
      profit: BigInt(976000000),
      genres: ['Ação', 'Aventura'],
      userId,
    },
    {
      title: 'Alita: Anjo de Combate',
      originalTitle: 'Alita: Battle Angel',
      tagline: 'Um anjo cai. Um guerreiro levanta.',
      overview:
        'Uma ciborgue é descoberta por um cientista. Ela não tem memória de sua vida anterior, exceto pelo seu treinamento em uma arte marcial letal. Depois de reconstruída, ela se torna uma caçadora de recompensas.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/548901b3-2367-4166-ab5b-f7b82089e8f6',
      releaseDate: new Date('2019-02-14'),
      runtime: 122,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '14 ANOS',
      voteCount: 7500,
      voteAverage: 75.0,
      budget: BigInt(170000000),
      revenue: BigInt(404852543),
      profit: BigInt(234852543),
      genres: ['Ficção científica', 'Ação'],
      userId,
    },
    {
      title: 'Como Treinar o seu Dragão 3',
      originalTitle: 'How to Train Your Dragon: The Hidden World',
      tagline: 'A amizade de uma vida inteira.',
      overview:
        'Soluço e Banguela finalmente descobrirão seus verdadeiros destinos: o chefe da aldeia como governante de Berk ao lado de Astrid, e o dragão como líder de sua própria espécie.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/568edce3-8ff2-4486-af01-7775b5dc9792',
      releaseDate: new Date('2019-01-17'),
      runtime: 104,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: 'Livre',
      voteCount: 6000,
      voteAverage: 82.0,
      budget: BigInt(129000000),
      revenue: BigInt(521799505),
      profit: BigInt(392799505),
      genres: ['Infantil', 'Aventura'],
      userId,
    },
    {
      title: 'Aquaman',
      originalTitle: 'Aquaman',
      tagline: 'O lar está chamando.',
      overview:
        'Arthur Curry, o herdeiro relutante do reino subaquático de Atlântida, deve dar um passo à frente para liderar seu povo e ser um herói para o mundo.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/f88e72e8-7c62-444a-9cbd-e750347cb030',
      releaseDate: new Date('2018-12-13'),
      runtime: 143,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '12 ANOS',
      voteCount: 11000,
      voteAverage: 68.0,
      budget: BigInt(160000000),
      revenue: BigInt(1148485886),
      profit: BigInt(988485886),
      genres: ['Ação', 'Aventura'],
      userId,
    },
    {
      title: 'O Menino que Queria Ser Rei',
      originalTitle: 'The Kid Who Would Be King',
      tagline: 'O destino não escolhe quem é digno.',
      overview:
        'Alex é um garoto comum que descobre a mítica espada Excalibur. Agora ele deve reunir seus amigos e inimigos em uma equipe de cavaleiros para derrotar a malvada feiticeira Morgana.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/68ff7de6-6698-4dc1-94c5-3558e377c042',
      releaseDate: new Date('2019-01-25'),
      runtime: 120,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '10 ANOS',
      voteCount: 1500,
      voteAverage: 60.0,
      budget: BigInt(59000000),
      revenue: BigInt(32140357),
      profit: BigInt(-26859643),
      genres: ['Fantasia', 'Aventura'],
      userId,
    },
    {
      title: 'Megarrromântico',
      originalTitle: "Isn't It Romantic",
      tagline: 'Uma comédia sobre o amor que você não vai acreditar.',
      overview:
        'Uma arquiteta cética em relação ao amor acorda e descobre que sua vida se transformou em uma comédia romântica, e ela é a protagonista.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/2214f3d1-6e21-4927-9027-d96118da212f',
      releaseDate: new Date('2019-02-13'),
      runtime: 89,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '12 ANOS',
      voteCount: 3000,
      voteAverage: 65.0,
      budget: BigInt(31000000),
      revenue: BigInt(48800000),
      profit: BigInt(17800000),
      genres: ['Romance', 'Comédia'],
      userId,
    },
    {
      title: 'Uma Nova Chance',
      originalTitle: 'Second Act',
      tagline: 'Seu passado não define seu futuro.',
      overview:
        'Maya é uma mulher inteligente que trabalha em uma loja de departamentos local. Ao falsificar seu currículo para conseguir um emprego corporativo de alto nível, ela prova que o conhecimento das ruas é tão valioso quanto um diploma universitário.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/f6611476-37a0-4654-8725-a2c8fe74e892',
      releaseDate: new Date('2018-12-21'),
      runtime: 103,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '12 ANOS',
      voteCount: 2000,
      voteAverage: 72.0,
      budget: BigInt(16000000),
      revenue: BigInt(72287231),
      profit: BigInt(56287231),
      genres: ['Romance', 'Comédia'],
      userId,
    },
    {
      title: 'Homem-Aranha no Aranhaverso',
      originalTitle: 'Spider-Man: Into the Spider-Verse',
      tagline: 'Qualquer um pode usar a máscara.',
      overview:
        'Miles Morales é um jovem que se torna o Homem-Aranha de sua realidade, mas ele logo descobre que não está sozinho quando outras versões do herói de diferentes dimensões aparecem para ajudá-lo a salvar o multiverso.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/09c7d4ef-7b94-47ae-9c27-a47eab38f062',
      releaseDate: new Date('2018-12-14'),
      runtime: 117,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: 'Livre',
      voteCount: 12000,
      voteAverage: 95.0,
      budget: BigInt(90000000),
      revenue: BigInt(375540831),
      profit: BigInt(285540831),
      genres: ['Ficção científica', 'Ação'],
      userId,
    },
    {
      title: 'Máquinas Mortais',
      originalTitle: 'Mortal Engines',
      tagline: 'Algumas cidades foram feitas para correr.',
      overview:
        'Milhares de anos depois que o mundo foi destruído por um evento cataclísmico, a civilização se adaptou a um novo modo de vida. Cidades móveis gigantes agora vagam pela Terra, caçando impiedosamente cidades menores.',
      posterUrl: 'https://www.figma.com/api/mcp/asset/39561999-a31a-4786-8d17-859630e19d73',
      releaseDate: new Date('2018-12-05'),
      runtime: 128,
      status: 'Lançado',
      originalLanguage: 'Inglês',
      certification: '12 ANOS',
      voteCount: 4000,
      voteAverage: 58.0,
      budget: BigInt(100000000),
      revenue: BigInt(83672673),
      profit: BigInt(-16327327),
      genres: ['Ficção científica', 'Ação'],
      userId,
    },
  ];

  console.log('Inserindo filmes...');
  for (const movie of moviesData) {
    await prisma.movie.create({
      data: movie,
    });
  }

  console.log('Concluído! 10 filmes inseridos com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
