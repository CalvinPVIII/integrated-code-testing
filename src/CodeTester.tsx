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
}

export default function CodeTester(props: CodeTesterProps) {
  const [userCode, setUserCode] = useState(props.starterCode);
  const [evalError, setEvalError] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [outputError, setOutputError] = useState("");

  const resetState = () => {
    setEvalError("");
    setCodeOutput("");
    setOutputError("");
  };

  const handleInput = (value: string) => setUserCode(value);

  const handleEval = async () => {
    resetState();
    fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id: props.language === "js" ? 63 : 51, // javascript
        source_code: btoa(userCode),
      }),
    })
      .then((r) =>
        r.json().then((data) => {
          console.log(data);
          //   setToken(data.token);
          setTimeout(() => getToken(data.token), 1000);
        })
      )
      .catch((e) => {
        setEvalError(e);
      });
  };

  const getToken = async (token: string) => {
    fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=stdout,stderr,status_id,language_id`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }).then((r) =>
      r.json().then((data) => {
        console.log(data);
        if (data.stderr) {
          console.log(atob(data.stderr));
          setOutputError(data.stderr);
        }
        if (data.stdout) {
          console.log(atob(data.stdout));
          setCodeOutput(atob(data.stdout));
        }
      })
    );
  };

  return (
    <>
      <AceEditor mode={props.language === "js" ? "javascript" : "csharp"} theme="twilight" onChange={handleInput} value={userCode} />
      <button onClick={handleEval}>Evaluate Code</button>
      {codeOutput !== "" ? <p>Output: {codeOutput}</p> : <></>}
      {outputError !== "" ? <p>Error: {outputError}</p> : <></>}
      {evalError !== "" ? <p>Error sending code: {evalError}</p> : <></>}
    </>
  );
}
