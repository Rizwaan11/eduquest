/**
 * fix-playground-data.mjs
 * 1. Delete orphan Chapter documents
 * 2. Add testFunctions to all 11 DSA problems
 * 3. Add codeTemplate/tokens/answers to 8 React interactive problems
 */
import 'dotenv/config';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected\n');

const db = mongoose.connection.db;

// ── 1. Orphan Chapter docs ────────────────────────────────────────────────
const orphanResult = await db.collection('chapters').deleteMany({
  courseId: { $in: [
    'aa53d9d6-2d31-4d19-93fa-5f09b7d46a07',
    '5e4f2a2b-85d5-4517-a19f-bb2dde8fa982',
  ]},
});
console.log(`Orphan chapters deleted: ${orphanResult.deletedCount}`);

// ── 2. DSA testFunctions ──────────────────────────────────────────────────
// All functions appended to user JS code, print one JSON line.

const DSA_TESTS = {
  'two-sum': `
function __t(){
  var r1=twoSum([2,7,11,15],9);
  var ok1=r1&&((r1[0]===0&&r1[1]===1)||(r1[0]===1&&r1[1]===0));
  var r2=twoSum([3,2,4],6);
  var ok2=r2&&((r2[0]===1&&r2[1]===2)||(r2[0]===2&&r2[1]===1));
  var r3=twoSum([3,3],6);
  var ok3=r3&&((r3[0]===0&&r3[1]===1)||(r3[0]===1&&r3[1]===0));
  if(!ok1) return console.log(JSON.stringify({success:false,message:"twoSum([2,7,11,15],9) should return [0,1], got "+JSON.stringify(r1)}));
  if(!ok2) return console.log(JSON.stringify({success:false,message:"twoSum([3,2,4],6) should return [1,2], got "+JSON.stringify(r2)}));
  if(!ok3) return console.log(JSON.stringify({success:false,message:"twoSum([3,3],6) should return [0,1], got "+JSON.stringify(r3)}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'maximum-subarray': `
function __t(){
  var r1=maxSubArray([-2,1,-3,4,-1,2,1,-5,4]);
  var r2=maxSubArray([1]);
  var r3=maxSubArray([5,4,-1,7,8]);
  if(r1!==6) return console.log(JSON.stringify({success:false,message:"maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) should return 6, got "+r1}));
  if(r2!==1) return console.log(JSON.stringify({success:false,message:"maxSubArray([1]) should return 1, got "+r2}));
  if(r3!==23) return console.log(JSON.stringify({success:false,message:"maxSubArray([5,4,-1,7,8]) should return 23, got "+r3}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'reverse-string': `
function __t(){
  var t1=["h","e","l","l","o"]; reverseString(t1);
  var t2=["H","a","n","n","a","h"]; reverseString(t2);
  if(JSON.stringify(t1)!==JSON.stringify(["o","l","l","e","h"]))
    return console.log(JSON.stringify({success:false,message:"reverseString([h,e,l,l,o]) should give [o,l,l,e,h], got "+JSON.stringify(t1)}));
  if(JSON.stringify(t2)!==JSON.stringify(["h","a","n","n","a","H"]))
    return console.log(JSON.stringify({success:false,message:"reverseString([H,a,n,n,a,h]) should give [h,a,n,n,a,H], got "+JSON.stringify(t2)}));
  console.log(JSON.stringify({success:true,message:"All 2 test cases passed!"}));
} __t();`,

  'valid-palindrome': `
function __t(){
  var r1=isPalindrome("A man, a plan, a canal: Panama");
  var r2=isPalindrome("race a car");
  var r3=isPalindrome(" ");
  if(r1!==true)  return console.log(JSON.stringify({success:false,message:"isPalindrome('A man, a plan, a canal: Panama') should be true"}));
  if(r2!==false) return console.log(JSON.stringify({success:false,message:"isPalindrome('race a car') should be false"}));
  if(r3!==true)  return console.log(JSON.stringify({success:false,message:"isPalindrome(' ') should be true"}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'container-with-most-water': `
function __t(){
  var r1=maxArea([1,8,6,2,5,4,8,3,7]);
  var r2=maxArea([1,1]);
  if(r1!==49) return console.log(JSON.stringify({success:false,message:"maxArea([1,8,6,2,5,4,8,3,7]) should return 49, got "+r1}));
  if(r2!==1)  return console.log(JSON.stringify({success:false,message:"maxArea([1,1]) should return 1, got "+r2}));
  console.log(JSON.stringify({success:true,message:"All 2 test cases passed!"}));
} __t();`,

  'reverse-linked-list': `
function __t(){
  function LN(v,n){this.val=v;this.next=n||null;}
  function mk(a){var h=null;for(var i=a.length-1;i>=0;i--)h=new LN(a[i],h);return h;}
  function ta(h){var r=[];while(h){r.push(h.val);h=h.next;}return r;}
  var r1=ta(reverseList(mk([1,2,3,4,5])));
  var r2=ta(reverseList(mk([1,2])));
  var r3=ta(reverseList(null));
  if(JSON.stringify(r1)!==JSON.stringify([5,4,3,2,1]))
    return console.log(JSON.stringify({success:false,message:"reverseList([1,2,3,4,5]) should give [5,4,3,2,1], got "+JSON.stringify(r1)}));
  if(JSON.stringify(r2)!==JSON.stringify([2,1]))
    return console.log(JSON.stringify({success:false,message:"reverseList([1,2]) should give [2,1], got "+JSON.stringify(r2)}));
  if(r3!==null&&JSON.stringify(r3)!==JSON.stringify([]))
    return console.log(JSON.stringify({success:false,message:"reverseList(null) should return null or []"}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'merge-two-sorted-lists': `
function __t(){
  function LN(v,n){this.val=v;this.next=n||null;}
  function mk(a){var h=null;for(var i=a.length-1;i>=0;i--)h=new LN(a[i],h);return h;}
  function ta(h){var r=[];while(h){r.push(h.val);h=h.next;}return r;}
  var r1=ta(mergeTwoLists(mk([1,2,4]),mk([1,3,4])));
  var r2=ta(mergeTwoLists(null,null));
  var r3=ta(mergeTwoLists(null,mk([0])));
  if(JSON.stringify(r1)!==JSON.stringify([1,1,2,3,4,4]))
    return console.log(JSON.stringify({success:false,message:"mergeTwoLists([1,2,4],[1,3,4]) should give [1,1,2,3,4,4], got "+JSON.stringify(r1)}));
  if(JSON.stringify(r2)!==JSON.stringify([]))
    return console.log(JSON.stringify({success:false,message:"mergeTwoLists(null,null) should give []"}));
  if(JSON.stringify(r3)!==JSON.stringify([0]))
    return console.log(JSON.stringify({success:false,message:"mergeTwoLists(null,[0]) should give [0]"}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'invert-binary-tree': `
function __t(){
  function TN(v,l,r){this.val=v;this.left=l||null;this.right=r||null;}
  function mk(a,i){if(!a||i>=a.length||a[i]===null||a[i]===undefined)return null;return new TN(a[i],mk(a,2*i+1),mk(a,2*i+2));}
  function lv(root){if(!root)return[];var q=[root],r=[];while(q.length){var n=q.shift();r.push(n?n.val:null);if(n){q.push(n.left);q.push(n.right);}}while(r.length&&r[r.length-1]===null)r.pop();return r;}
  var r1=lv(invertTree(mk([4,2,7,1,3,6,9],0)));
  var r2=lv(invertTree(mk([2,1,3],0)));
  var r3=invertTree(null);
  if(JSON.stringify(r1)!==JSON.stringify([4,7,2,9,6,3,1]))
    return console.log(JSON.stringify({success:false,message:"invertTree([4,2,7,1,3,6,9]) should give [4,7,2,9,6,3,1], got "+JSON.stringify(r1)}));
  if(JSON.stringify(r2)!==JSON.stringify([2,3,1]))
    return console.log(JSON.stringify({success:false,message:"invertTree([2,1,3]) should give [2,3,1], got "+JSON.stringify(r2)}));
  if(r3!==null)
    return console.log(JSON.stringify({success:false,message:"invertTree(null) should return null"}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'maximum-depth-of-binary-tree': `
function __t(){
  function TN(v,l,r){this.val=v;this.left=l||null;this.right=r||null;}
  function mk(a,i){if(!a||i>=a.length||a[i]===null||a[i]===undefined)return null;return new TN(a[i],mk(a,2*i+1),mk(a,2*i+2));}
  var r1=maxDepth(mk([3,9,20,null,null,15,7],0));
  var r2=maxDepth(mk([1,null,2],0));
  var r3=maxDepth(null);
  if(r1!==3) return console.log(JSON.stringify({success:false,message:"maxDepth([3,9,20,null,null,15,7]) should return 3, got "+r1}));
  if(r2!==2) return console.log(JSON.stringify({success:false,message:"maxDepth([1,null,2]) should return 2, got "+r2}));
  if(r3!==0) return console.log(JSON.stringify({success:false,message:"maxDepth(null) should return 0, got "+r3}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'median-of-two-sorted-arrays': `
function __t(){
  var r1=findMedianSortedArrays([1,3],[2]);
  var r2=findMedianSortedArrays([1,2],[3,4]);
  var r3=findMedianSortedArrays([0,0],[0,0]);
  if(Math.abs(r1-2.0)>0.0001) return console.log(JSON.stringify({success:false,message:"findMedianSortedArrays([1,3],[2]) should return 2.0, got "+r1}));
  if(Math.abs(r2-2.5)>0.0001) return console.log(JSON.stringify({success:false,message:"findMedianSortedArrays([1,2],[3,4]) should return 2.5, got "+r2}));
  if(Math.abs(r3-0.0)>0.0001) return console.log(JSON.stringify({success:false,message:"findMedianSortedArrays([0,0],[0,0]) should return 0.0, got "+r3}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,

  'trapping-rain-water': `
function __t(){
  var r1=trap([0,1,0,2,1,0,1,3,2,1,2,1]);
  var r2=trap([4,2,0,3,2,5]);
  var r3=trap([3,0,2,0,4]);
  if(r1!==6) return console.log(JSON.stringify({success:false,message:"trap([0,1,0,2,1,0,1,3,2,1,2,1]) should return 6, got "+r1}));
  if(r2!==9) return console.log(JSON.stringify({success:false,message:"trap([4,2,0,3,2,5]) should return 9, got "+r2}));
  if(r3!==7) return console.log(JSON.stringify({success:false,message:"trap([3,0,2,0,4]) should return 7, got "+r3}));
  console.log(JSON.stringify({success:true,message:"All 3 test cases passed!"}));
} __t();`,
};

const dsaCurriculum = await db.collection('curriculums').findOne({ language: 'dsa' });
let dsaCount = 0;
for (const ch of dsaCurriculum.chapters) {
  for (const p of ch.problems) {
    if (DSA_TESTS[p.id]) {
      p.testFunction = DSA_TESTS[p.id];
      dsaCount++;
    }
  }
}
await db.collection('curriculums').replaceOne({ language: 'dsa' }, dsaCurriculum);
console.log(`DSA testFunctions added: ${dsaCount}`);

// ── 3. React interactive problem structures ───────────────────────────────
// Each problem needs: codeTemplate[], tokens[], answers{}

const REACT_INTERACTIVE = {
  'react-ib-jsx-1': {
    description: 'Fill in the correct JSX tag to make this component render an h1 heading.',
    codeTemplate: [
      { type: 'code', text: 'function App() {\n  return (\n    <' },
      { type: 'blank', id: 'b1', color: 'sky' },
      { type: 'code', text: '>Hello World</' },
      { type: 'blank', id: 'b2', color: 'sky' },
      { type: 'code', text: '>\n  );\n}' },
    ],
    tokens: [
      { id: 't1', text: 'h1', color: 'sky' },
      { id: 't2', text: 'div', color: 'amber' },
      { id: 't3', text: 'p', color: 'rose' },
      { id: 't4', text: 'span', color: 'purple' },
    ],
    answers: { b1: 't1', b2: 't1' },
  },

  'react-ib-jsx-2': {
    description: 'Use curly braces to embed the variable value inside JSX.',
    codeTemplate: [
      { type: 'code', text: 'const name = "World";\nfunction App() {\n  return <h1>Hello, {' },
      { type: 'blank', id: 'b1', color: 'emerald' },
      { type: 'code', text: '}!</h1>;\n}' },
    ],
    tokens: [
      { id: 't1', text: 'name', color: 'emerald' },
      { id: 't2', text: '"World"', color: 'amber' },
      { id: 't3', text: 'this.name', color: 'rose' },
      { id: 't4', text: 'props.name', color: 'purple' },
    ],
    answers: { b1: 't1' },
  },

  'react-ib-comp-1': {
    description: 'Fill in the destructured parameter to access the name prop inside the component.',
    codeTemplate: [
      { type: 'code', text: 'function Greeting({ ' },
      { type: 'blank', id: 'b1', color: 'sky' },
      { type: 'code', text: ' }) {\n  return <h1>Hello, {name}!</h1>;\n}' },
    ],
    tokens: [
      { id: 't1', text: 'name', color: 'sky' },
      { id: 't2', text: 'props', color: 'amber' },
      { id: 't3', text: 'children', color: 'rose' },
      { id: 't4', text: 'value', color: 'purple' },
    ],
    answers: { b1: 't1' },
  },

  'react-ib-comp-2': {
    description: 'Fill in the prop name to pass the name variable to the Greeting component.',
    codeTemplate: [
      { type: 'code', text: 'function App() {\n  const name = "Alice";\n  return <Greeting ' },
      { type: 'blank', id: 'b1', color: 'emerald' },
      { type: 'code', text: '={name} />;\n}' },
    ],
    tokens: [
      { id: 't1', text: 'name', color: 'emerald' },
      { id: 't2', text: 'value', color: 'amber' },
      { id: 't3', text: 'text', color: 'rose' },
      { id: 't4', text: 'label', color: 'purple' },
    ],
    answers: { b1: 't1' },
  },

  'react-ib-state-1': {
    description: 'Destructure useState correctly for a counter: the state variable and its setter.',
    codeTemplate: [
      { type: 'code', text: 'const [' },
      { type: 'blank', id: 'b1', color: 'sky' },
      { type: 'code', text: ', ' },
      { type: 'blank', id: 'b2', color: 'emerald' },
      { type: 'code', text: '] = useState(0);' },
    ],
    tokens: [
      { id: 't1', text: 'count', color: 'sky' },
      { id: 't2', text: 'setCount', color: 'emerald' },
      { id: 't3', text: 'state', color: 'amber' },
      { id: 't4', text: 'setState', color: 'rose' },
      { id: 't5', text: 'value', color: 'purple' },
      { id: 't6', text: 'onChange', color: 'zinc' },
    ],
    answers: { b1: 't1', b2: 't2' },
  },

  'react-ib-state-2': {
    description: 'Fill in the React event prop that wires a click handler to a button.',
    codeTemplate: [
      { type: 'code', text: 'function App() {\n  const handleClick = () => alert("Clicked!");\n  return (\n    <button ' },
      { type: 'blank', id: 'b1', color: 'sky' },
      { type: 'code', text: '={handleClick}>\n      Click me\n    </button>\n  );\n}' },
    ],
    tokens: [
      { id: 't1', text: 'onClick', color: 'sky' },
      { id: 't2', text: 'onclick', color: 'amber' },
      { id: 't3', text: 'click', color: 'rose' },
      { id: 't4', text: 'onPress', color: 'purple' },
    ],
    answers: { b1: 't1' },
  },

  'react-ib-effect-1': {
    description: 'Fill in the dependency so this effect re-runs only when count changes.',
    codeTemplate: [
      { type: 'code', text: 'useEffect(() => {\n  document.title = `Count: ${count}`;\n}, [' },
      { type: 'blank', id: 'b1', color: 'sky' },
      { type: 'code', text: ']);' },
    ],
    tokens: [
      { id: 't1', text: 'count', color: 'sky' },
      { id: 't2', text: 'document', color: 'amber' },
      { id: 't3', text: 'title', color: 'rose' },
      { id: 't4', text: 'effect', color: 'purple' },
    ],
    answers: { b1: 't1' },
  },

  'react-ib-list-1': {
    description: 'Fill in the special prop React requires on each item when rendering a list.',
    codeTemplate: [
      { type: 'code', text: 'const items = ["a", "b", "c"];\nreturn (\n  <ul>\n    {items.map((item, i) => (\n      <li ' },
      { type: 'blank', id: 'b1', color: 'sky' },
      { type: 'code', text: '={i}>{item}</li>\n    ))}\n  </ul>\n);' },
    ],
    tokens: [
      { id: 't1', text: 'key', color: 'sky' },
      { id: 't2', text: 'id', color: 'amber' },
      { id: 't3', text: 'index', color: 'rose' },
      { id: 't4', text: 'ref', color: 'purple' },
    ],
    answers: { b1: 't1' },
  },
};

const reactCurriculum = await db.collection('curriculums').findOne({ language: 'react' });
let reactCount = 0;
for (const ch of reactCurriculum.chapters) {
  for (const p of ch.problems) {
    const fix = REACT_INTERACTIVE[p.id];
    if (fix) {
      p.description   = fix.description;
      p.codeTemplate  = fix.codeTemplate;
      p.tokens        = fix.tokens;
      p.answers       = fix.answers;
      reactCount++;
    }
  }
}
await db.collection('curriculums').replaceOne({ language: 'react' }, reactCurriculum);
console.log(`React interactive problems fixed: ${reactCount}`);

// ── Done ──────────────────────────────────────────────────────────────────
await mongoose.disconnect();
console.log('\nDone.');
