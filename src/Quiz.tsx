import CodeTester from "./CodeTester";

export default function Quiz() {
  const jsStarterCode = `function checkIsEven(number){

}
    `;

  const cSharpStarterCode = `public static bool EvenNumberOfChars(string word)
{
        
}`;

  return (
    <>
      <h1>JavaScript Quiz:</h1>
      <h3>Write a function in JavaScript that returns true if a number is even, or false if it is not</h3>
      <CodeTester
        language="js"
        starterCode={jsStarterCode}
        functionName="checkIsEven"
        testCases={["2", "4", "7"]}
        expectedResult={"true true false"}
      />
      <h1>C# Quiz:</h1>
      <h3>
        Write a function in C# that takes in a string and returns true if that string has an even number of characters, and false if it has an odd
        number of characters
      </h3>
      <CodeTester
        language="c#"
        starterCode={cSharpStarterCode}
        functionName="EvenNumberOfChars"
        testCases={[`"1"`, `"11"`, `"111"`]}
        expectedResult={"false true false"}
      />
    </>
  );
}
