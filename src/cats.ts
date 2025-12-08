export type CatItem = {
  id: string;      // stable id
  url: string;     // image URL from cataas
  alt: string;     // accessibility text
};

const BASE = 'https://cataas.com/cat'; // Cataas base

// Fixed-size for consistent layout; also can vary filters for fun
export const cats: CatItem[] = [
  { id: 'c1',  url: `${BASE}?width=600&height=800&random=1`,  alt: 'Curious tabby looking up' },
  { id: 'c2',  url: `${BASE}?width=600&height=800&random=2`,  alt: 'Sleepy kitten on blanket' },
  { id: 'c3',  url: `${BASE}?width=600&height=800&random=3`,  alt: 'Playful cat with yarn' },
  { id: 'c4',  url: `${BASE}?width=600&height=800&random=4`,  alt: 'Black cat in sunlight' },
  { id: 'c5',  url: `${BASE}?width=600&height=800&random=5`,  alt: 'Calico cat near window' },
  { id: 'c6',  url: `${BASE}?width=600&height=800&random=6`,  alt: 'Fluffy white kitten' },
  { id: 'c7',  url: `${BASE}?width=600&height=800&random=7`,  alt: 'Cat mid-meow' },
  { id: 'c8',  url: `${BASE}?width=600&height=800&random=8`,  alt: 'Orange cat lounging' },
  { id: 'c9',  url: `${BASE}?width=600&height=800&random=9`,  alt: 'Kitten peeking behind plant' },
  { id: 'c10', url: `${BASE}?width=600&height=800&random=10`, alt: 'Cat with big eyes' },
  { id: 'c11', url: `${BASE}?width=600&height=800&random=11`, alt: 'Cat on bookshelf' },
  { id: 'c12', url: `${BASE}?width=600&height=800&random=12`, alt: 'Grey cat profile' },
  { id: 'c13', url: `${BASE}?width=600&height=800&random=13`, alt: 'Kitten with ball' },
  { id: 'c14', url: `${BASE}?width=600&height=800&random=14`, alt: 'Cat in garden' },
  { id: 'c15', url: `${BASE}?width=600&height=800&random=15`, alt: 'Cat on couch' },
  { id: 'c16', url: `${BASE}?width=600&height=800&random=16`, alt: 'Cat wearing bow tie' },
];
