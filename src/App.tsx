import CodeTester from "./CodeTester";

const jsStaterCode = `function helloWorld(){
    
}
console.log(helloWorld())
`;

function App() {
  return (
    <>
      <h1>Code Tester</h1>
      <h2>JavaScript</h2>
      <CodeTester starterCode={jsStaterCode} language="js" />
    </>
  );
}

export default App;
