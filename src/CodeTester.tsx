import AceEditor from "react-ace";
import { useState } from "react";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";
import "./App.css";

interface CodeTesterProps {
  starterCode: string;
  language: "js" | "c#";
  functionName?: string;
  testCases?: string[];
  expectedResult?: string;
}

export default function CodeTester(props: CodeTesterProps) {
  const [userCode, setUserCode] = useState(props.starterCode);
  const [evalError, setEvalError] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [outputError, setOutputError] = useState("");
  const [evalResult, setEvalResult] = useState("");
  const [incorrectResponses, setIncorrectResponses] = useState<number>(0);

  const resetState = () => {
    setEvalError("");
    setCodeOutput("");
    setOutputError("");
  };

  // In JavaScript, using console.log will write to the standard output, so I need to take the user's code and rewrite it slightly to console log it.
  const buildJavaScriptInputString = (inputCode: string): string => {
    let inputString = inputCode;
    if (props.functionName) {
      // the function name is a prop passed from the parent, that name is what is called later
      if (props.testCases) {
        // the parent component also provides an array of test cases. These get passed as arguments to the user's code
        props.testCases.forEach((testCase) => {
          inputString += `\n console.log(${props.functionName}(${testCase}))`; // taking the user's string, and adding in the console logs to make sure there is a standard output
        });
      } else {
        inputString += `\n console.log(${props.functionName}())`;
      }
    }
    return inputString;
  };

  // Evaluating C# is a bit different, as everything needs to be done through the Main function.
  const buildCsharpInputString = (inputCode: string): string => {
    if (props.functionName) {
      let inputString = `public class Program{ ${inputCode} public static void Main(){ \n`; // here I am assembling the first part of the Main function. I am defining the Program class as well as the user's inputted code as a member of the Program class. That way we can call it in the Main function later. After that I provide the first part of the Main function
      if (props.testCases) {
        props.testCases.forEach((testCase) => {
          // similar to the JavaScript examples above, if there are test cases I am running the user's function with the test cases as arguments
          inputString += `\n System.Console.WriteLine(${props.functionName}(${testCase}));`;
        });
      } else {
        inputString += `\n System.Console.WriteLine(${props.functionName}());`;
      }
      inputString += "}}"; // this last line is the closing brackets for the Main function and the Program class declaration
      return inputString;
    } else {
      return inputCode;
    }
  };

  const handleInput = (value: string) => setUserCode(value);

  // this functions generates the token that is used to check the result of the code
  const handleEval = async () => {
    resetState();
    const input = props.language === "js" ? buildJavaScriptInputString(userCode) : buildCsharpInputString(userCode);
    fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true", {
      // Judge0 recommends using base64 encoded string to prevent any errors, so I include that parameter in the request
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        // body needs to be a string, using JSON.stringify
        language_id: props.language === "js" ? 93 : 51, // to run Javascript code, the id can either be 63 (node js v12) or 93 (node js v18). For C#, the ID is 51. It uses version 6 of the Mono .NET framework.
        source_code: btoa(input), // the btoa function is what base64 encodes the user input
      }),
    })
      .then((r) =>
        r.json().then((data) => {
          console.log(data);
          // the submission token is stored in the .token property of the response
          setTimeout(() => getSubmissionResult(data.token), 1000); // waiting 1 second so the api can catch up, otherwise the token is not valid yet
        })
      )
      .catch((e) => {
        setEvalError(e);
      });
  };

  const getSubmissionResult = async (token: string) => {
    fetch(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=stdout,stderr,status_id,language_id,status,compile_output`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    ).then((r) =>
      r.json().then((data) => {
        console.log(data);
        if (data.stderr || data.compile_output) {
          // for Javascript errors they will show up in the .stderr property of the response object, for C# errors like syntax or setting a string to a number, those will be in the .compile_output of the response. If there are no issues with code these properties are null
          setIncorrectResponses(incorrectResponses + 1); // placeholder for tracking incorrect responses, just some simple state
          setOutputError(atob(data.compile_output || data.stderr)); // displaying error on the page. It comes back base64 encoded, so I am decoding it with the atob method
        }
        if (data.stdout) {
          // if the code was able to be ran
          if (props.expectedResult) {
            // this prop comes from the parent component, it's a string of what the results should be after running the user's code against the test cases
            if (props.expectedResult.replace(/\s/g, "").toLowerCase() === atob(data.stdout).replace(/\s/g, "").toLowerCase()) {
              // cleaning and base64 decoding the response from the api and the expected results

              // the rest of this function is just setting state so the user can see the results
              setEvalResult("Correct!");
            } else {
              setIncorrectResponses(incorrectResponses + 1);
              setEvalResult("Not Quite...");
            }
          }
          console.log(atob(data.stdout));

          setCodeOutput(atob(data.stdout));
        }
      })
    );
  };

  return (
    <>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <AceEditor mode={props.language === "js" ? "javascript" : "csharp"} theme="twilight" onChange={handleInput} value={userCode} />
      </div>
      <button onClick={handleEval}>Evaluate Code</button>
      {codeOutput !== "" ? <p>Output: {codeOutput}</p> : <></>}
      {outputError !== "" ? <p>Error: {outputError}</p> : <></>}
      {evalError !== "" ? <p>Error sending code: {evalError}</p> : <></>}
      {evalResult !== "" ? <p>{evalResult}</p> : <></>}
      <p>Incorrect responses: {incorrectResponses}</p>
    </>
  );
}
