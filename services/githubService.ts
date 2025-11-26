// GitHub API Service for fetching recipes from open source repositories

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

// Recipe repositories
const REPOS = {
  HowToCook: {
    owner: 'Anduin2017',
    repo: 'HowToCook',
    recipePaths: [
      'dishes/meat_dish',
      'dishes/soup',
      'dishes/aquatic',
      'dishes/semi-finished'
    ]
  },
  CookLikeHOC: {
    owner: 'Gar-b-age',
    repo: 'CookLikeHOC',
    recipePaths: [
      '炖菜',
      '砂锅菜',
      '汤',
      '煮锅'
    ]
  }
};

// Known recipe files for braised/stewed dishes
const STEW_RECIPES = {
  HowToCook: [
    'dishes/meat_dish/红烧肉/简易红烧肉.md',
    'dishes/meat_dish/梅菜扣肉/梅菜扣肉.md',
    'dishes/meat_dish/东坡肉/东坡肉.md',
    'dishes/meat_dish/炖牛肉/炖牛肉.md',
    'dishes/soup/鸡汤/鸡汤.md',
    'dishes/soup/番茄牛腩汤/番茄牛腩汤.md',
    'dishes/aquatic/红烧鱼/红烧鱼.md'
  ],
  CookLikeHOC: [
    '炖菜/土豆牛腩.md',
    '炖菜/梅干菜凤爪翅.md',
    '炖菜/白菜炖豆腐.md',
    '炖菜/红烧鱼块.md',
    '炖菜/香辣鸡杂.md',
    '炖菜/鸡血汤.md',
    '炖菜/麻婆豆腐.md',
    '砂锅菜/砂锅三鲜豆腐.md',
    '砂锅菜/砂锅原味鸡汤米线.md',
    '砂锅菜/砂锅牛杂煲.md',
    '砂锅菜/砂锅盐焗鸡.md',
    '砂锅菜/砂锅酸菜鱼.md'
  ]
};

export interface RecipeSource {
  repo: string;
  path: string;
  content: string;
  url: string;
}

/**
 * Fetch a recipe markdown file from GitHub
 */
export async function fetchRecipeFromGitHub(
  repo: 'HowToCook' | 'CookLikeHOC',
  filePath: string
): Promise<RecipeSource> {
  const repoConfig = REPOS[repo];
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const url = `${GITHUB_RAW_BASE}/${repoConfig.owner}/${repoConfig.repo}/main/${encodedPath}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
    }

    const content = await response.text();
    return {
      repo,
      path: filePath,
      content,
      url: `https://github.com/${repoConfig.owner}/${repoConfig.repo}/blob/main/${filePath}`
    };
  } catch (error) {
    console.error(`Error fetching recipe from ${repo}:`, error);
    throw error;
  }
}

/**
 * Search for recipes that match given ingredients
 * Returns a random selection of relevant recipes
 */
export async function searchRecipesByIngredients(
  ingredients: string,
  maxResults: number = 3
): Promise<RecipeSource[]> {
  const ingredientLower = ingredients.toLowerCase();
  const results: RecipeSource[] = [];

  // Simple keyword matching for now
  const keywords = ingredientLower.split(/[,，\s]+/).filter(k => k.length > 0);

  // Try to fetch relevant recipes from both repos
  const allRecipes = [
    ...STEW_RECIPES.HowToCook.map(path => ({ repo: 'HowToCook' as const, path })),
    ...STEW_RECIPES.CookLikeHOC.map(path => ({ repo: 'CookLikeHOC' as const, path }))
  ];

  // Shuffle and take a few
  const shuffled = allRecipes.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(maxResults, shuffled.length));

  // Fetch the actual content
  for (const { repo, path } of selected) {
    try {
      const recipe = await fetchRecipeFromGitHub(repo, path);
      results.push(recipe);
    } catch (error) {
      console.warn(`Failed to fetch ${repo}/${path}:`, error);
      // Continue with other recipes
    }
  }

  return results;
}

/**
 * Get a random recipe for inspiration
 */
export async function getRandomRecipe(): Promise<RecipeSource> {
  const allRecipes = [
    ...STEW_RECIPES.HowToCook.map(path => ({ repo: 'HowToCook' as const, path })),
    ...STEW_RECIPES.CookLikeHOC.map(path => ({ repo: 'CookLikeHOC' as const, path }))
  ];

  const random = allRecipes[Math.floor(Math.random() * allRecipes.length)];
  return await fetchRecipeFromGitHub(random.repo, random.path);
}
