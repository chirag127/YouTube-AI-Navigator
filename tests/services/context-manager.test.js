import { ContextManager } from '../../../extension/services/context-manager.js';

vi.mock('../../../extension/api/tmdb.js', () => ({
  TmdbAPI: vi.fn().mockImplementation(() => ({
    searchMovie: vi.fn().mockResolvedValue([]),
    searchTV: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/musicbrainz.js', () => ({
  MusicBrainzAPI: vi.fn().mockImplementation(() => ({
    searchArtist: vi.fn().mockResolvedValue([]),
    searchRelease: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/igdb.js', () => ({
  IgdbAPI: vi.fn().mockImplementation(() => ({
    searchGame: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/openlibrary.js', () => ({
  OpenLibraryAPI: vi.fn().mockImplementation(() => ({
    searchBook: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/newsdata.js', () => ({
  NewsDataAPI: vi.fn().mockImplementation(() => ({
    searchNews: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/semanticscholar.js', () => ({
  SemanticScholarAPI: vi.fn().mockImplementation(() => ({
    searchPaper: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/google-factcheck.js', () => ({
  GoogleFactCheckAPI: vi.fn().mockImplementation(() => ({
    searchClaims: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/wikidata.js', () => ({
  WikidataAPI: vi.fn().mockImplementation(() => ({
    searchEntity: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../../extension/api/datamuse.js', () => ({
  DatamuseAPI: vi.fn().mockImplementation(() => ({
    getRelatedWords: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('../../../extension/api/openmeteo.js', () => ({
  OpenMeteoAPI: vi.fn().mockImplementation(() => ({
    getCoordinates: vi.fn().mockResolvedValue(null),
    getWeather: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  w: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/async.js', () => ({
  ps: vi.fn(promises => Promise.allSettled(promises)),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
  aia: vi.fn(obj => Array.isArray(obj)),
}));

describe('ContextManager', () => {
  let manager;
  let mockConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      tmdb: { enabled: true, key: 'test-key' },
      musicBrainz: { enabled: true },
      igdb: { enabled: true },
      openLibrary: { enabled: true },
      newsData: { enabled: true },
      semanticScholar: { enabled: true },
      googleFactCheck: { enabled: true },
      wikidata: { enabled: true },
      datamuse: { enabled: true },
      openMeteo: { enabled: true },
    };
    manager = new ContextManager(mockConfig);
  });

  it('should initialize with all APIs', () => {
    expect(manager.apis).toHaveProperty('tmdb');
    expect(manager.apis).toHaveProperty('musicbrainz');
    expect(manager.apis).toHaveProperty('igdb');
    expect(manager.apis).toHaveProperty('openlibrary');
    expect(manager.apis).toHaveProperty('newsdata');
    expect(manager.apis).toHaveProperty('semanticscholar');
    expect(manager.apis).toHaveProperty('factcheck');
    expect(manager.apis).toHaveProperty('wikidata');
    expect(manager.apis).toHaveProperty('datamuse');
    expect(manager.apis).toHaveProperty('openmeteo');
  });

  it('should fetch context for music videos', async () => {
    const metadata = {
      title: 'Song Title Official Video',
      category: 'Music',
      author: 'Artist Name',
    };

    await manager.fetchContext(metadata);

    expect(manager.apis.musicbrainz.searchArtist).toHaveBeenCalledWith('Artist Name');
    expect(manager.apis.musicbrainz.searchRelease).toHaveBeenCalledWith(
      'Song Title Official Video',
      'Artist Name'
    );
  });

  it('should fetch context for movies', async () => {
    const metadata = {
      title: 'Movie Title',
      category: 'Film & Animation',
    };

    await manager.fetchContext(metadata);

    expect(manager.apis.tmdb.searchMovie).toHaveBeenCalledWith('Movie Title');
    expect(manager.apis.tmdb.searchTV).toHaveBeenCalledWith('Movie Title');
  });

  it('should fetch context for games', async () => {
    const metadata = {
      title: 'Game Title',
      category: 'Gaming',
    };

    await manager.fetchContext(metadata);

    expect(manager.apis.igdb.searchGame).toHaveBeenCalledWith('Game Title');
  });

  it('should fetch context for news', async () => {
    const metadata = {
      title: 'News Title',
      category: 'News & Politics',
    };

    await manager.fetchContext(metadata);

    expect(manager.apis.newsdata.searchNews).toHaveBeenCalledWith('News Title');
    expect(manager.apis.factcheck.searchClaims).toHaveBeenCalledWith('News Title');
  });

  it('should fetch context for education videos', async () => {
    const metadata = {
      title: 'Educational Video',
      category: 'Education',
    };

    await manager.fetchContext(metadata);

    expect(manager.apis.semanticscholar.searchPaper).toHaveBeenCalledWith('Educational Video');
    expect(manager.apis.openlibrary.searchBook).toHaveBeenCalledWith('Educational Video');
  });

  it('should respect disabled APIs', async () => {
    const disabledConfig = {
      ...mockConfig,
      tmdb: { enabled: false },
    };
    manager = new ContextManager(disabledConfig);

    const metadata = {
      title: 'Movie',
      category: 'Film & Animation',
    };

    await manager.fetchContext(metadata);

    expect(manager.apis.tmdb.searchMovie).not.toHaveBeenCalled();
  });
});
