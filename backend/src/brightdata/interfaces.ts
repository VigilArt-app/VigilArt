export interface GoogleLensExactResult {
  title?: string;
  link?: string;
  extensions?: [string];
  source?: string;
  logo?: string;
  image?: string;
  image_url?: string;
  image_base64?: string;
  rank?: number;
  global_rank?: number;
}

//    "title": "The differences between RTK and PPK. Which method is best for ...",
//   "link": "https://www.ardusimple.com/ppk-vs-rtk/",
//   "extensions": [
//     "1,000x400"
//   ],
//   "source": "ArduSimple",
//   "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAA...",
//   "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTSOfaprHZdVN8UCo8I3KGyyCdaDUgKmETI7BVYwD8EnDpTH2304GR6ic9&s",
//   "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTSOfaprHZdVN8UCo8I3KGyyCdaDUgKmETI7BVYwD8EnDpTH2304GR6ic9&s",
//   "rank": 15,
//   "global_rank": 15
