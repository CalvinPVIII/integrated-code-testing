import CodeTester from "./CodeTester";

const jsStarterCode = `function greeting(){
    return "Hello world";
}
console.log(greeting()) 
`;

const csharpStarterCode = `public class Program
{
  public static void Main()
  {
    System.Console.WriteLine("Hello world");
  }
}
`;

// public class Hello {
//     public static void Main() {
//         System.Console.WriteLine("hello, world");
//     }
// }
function App() {
  return (
    <>
      <h1>Code Tester</h1>
      <h2>JavaScript</h2>
      <CodeTester starterCode={jsStarterCode} language="js" />
      <h2>C#</h2>
      <CodeTester starterCode={csharpStarterCode} language="c#" />
    </>
  );
}

export default App;
