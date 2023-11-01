# Code Quizzes

### Description:

This application is built as a proof of concept for creating coding quizzes in a React component. It uses [React Ace](https://github.com/securingsincity/react-ace) for the editor, and [Judge0](https://ce.judge0.com/) for running the code

### Technologies Used:

- Vite
- TypeScript
- NodeJs v18.18.2
- Judge0
- React Ace
- React Router

### Setup Instructions

- Clone this project to a directory of your choice, using the command `git clone https://github.com/CalvinPVIII/integrated-code-testing.git`
- Navigate to the root of the project, and create a `.env` file.
- Create a [RapidAPI account](https://rapidapi.com/).
- Go to [https://rapidapi.com/judge0-official/api/judge0-ce/pricing](https://rapidapi.com/judge0-official/api/judge0-ce/pricing) and click the "Subscribe" button under the subscription of your choice.
- After subscribing, go to the [Judge0 RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce/) dashboard.
- At the bottom of the page, under the "Header Parameters" section. You should see a field labeled "X-RapidAPI-Key". Copy the string of characters to the right of that field.
- In the `.env` file, add this line: `VITE_API_KEY = {your api key here}`
- **Be sure to replace `{your api key here}` with the key you copied earlier**
- In your terminal of choice, navigate to the root of the project and run the command `npm run dev`
- It should load up in your default browser automatically. If it does not, the terminal will have a localhost link you can click or copy and paste directly in your browser.

### How to create a quiz question

The heavy lifting is done in the `CodeTester` component. This component takes 5 props:

**language**: A string of either `c#`or `js`.

**starterCode**: A string that is a code snippet that will first appear in the editor. It acts as a starting place for the quiz. Usually it is just a function declaration.

JavaScript Example:

```
`function doubleTheNumber(number){

}`
```

C# Example:

```
`public static bool EvenNumberOfChars(string word)
{

}`
```

_The formatting of this string matters, otherwise it will show up weird in the editor. See the `Quiz.tsx` file for an example what this should look like_

**functionName**: A string of what the user's function should be called. This is important as it will be used later to get an output from the API. If the starter code provided is declaring a function, the functionName should match that.

**testCases**: An array of string values that will be given to the function as test cases. These will be directly passed to the user's function as arguments. Quotations are important. For example, this array: `["1", "2", "3"]` will be passed in as _integers_, while this array: `['"1"', '"2"', '"3"']` will be passed in as _strings_.

**expectedResult**: A singular string of what the expected outputs should be based on the test cases, separated by spaces. For example, if the question was to write a function that takes in a number and doubles it, if these are the test cases: `["3","4","5"]`, then the expectedResult would be a singular string of `"6 8 10"`.

While the `functionName`, `testCases`, and `expectedResult` props are technically optional, if they are not provided and the `starterCode` is not formatted in a specific way, the code will not function as expected. See the `App.tsx` file for a working example of the `CodeTester` component without optional parameters.

Where/How the `CodeTester` component is rendered is up to you. See the `Quiz.tsx` file for an example.

### How It Works:

Judge0 is the heart of this application, as that is the API that runs the code. The bulk of the logic lies in the `CodeTester.tsx` file, and I have included comments for the important lines to explain exactly what everything is doing. But here is a more high level explanation. What the API takes is a base64 encoded string that is the code snippet you want to test. In order to actually see a response from the user's code, it needs to write to the standard output stream of the language. In JavaScript that is done with `console.log` and with C# that is done with `System.Console.WriteLine`. To abstract as much as that process as possible, I am taking the user's input, and either adding in a console log of the function, or building the Main function around it and calling it within.

**The basic process for JavaScript code:**

- The user writes their code in the editor. This is stored in a slice of state as a string. The value of the string would end up looking something like this:

  `"function exampleFunction(number){return number*2}"`

- The parent component should be passing in a few things, the expected name of the function, and any values that will be passed to the function to be used as test cases. The `buildJavaScriptInputString` function will add a few things to this string in order to write to the standard output stream. It will check what the function name is, as well as what the array of test cases are, and will restructure the string to look something like this:

```
functionName => "exampleFunction"
testCases => [1,2,3]

string after function runs =>
"function exampleFunction(number){return number*2}
 console.log(exampleFunction(1))
 console.log(exampleFunction(2))
 console.log(exampleFunction(3))
"
```

- This string is sent to the API to be evaluated

**The basic process for C# code:**
_The application entry point for C# is the `Main` function, so this process is a bit more involved._

- The user writes their code in the editor. This is stored in a slice of state as a string. The value of the string would end up looking something like this:

  `"public static num ExampleFunction(int num){return num*2}"`

- The `buildCsharpInputString` function will start by writing the first half of the Program class and Main function. It defines the Program class, defines the user's function as a member of the class, and partially writes the Main function. It will end up looking something like this:

```
"public class Program
{
   public static num ExampleFunction(int num){return num*2}

   public static void Main(){
}"
```

- The next steps in the process are the same as with JavaScript code. The function will grab the function name and test cases, then will call System.Console.WriteLine in order to write to the standard output stream. The string will look something like this:

```
functionName => "ExampleFunction"
testCases => [1,2,3]

"public class Program
{
   public static num ExampleFunction(int num){return num*2}

   public static void Main()
   {
      System.Console.WriteLine(ExampleFunction(1))
      System.Console.WriteLine(ExampleFunction(2))
      System.Console.WriteLine(ExampleFunction(3))
   }
}"
```

- This string is sent to the API to be evaluated

_Note: the exact formatting of the output string will not look as clean as the examples provided. Indentation/Spacing isn't seen by the user, and it doesn't effect evaluation for C# or JavaScript specifically. The actual output string will look much more condensed_

### How the API call works:

The main functionality is broken down into two API calls. The first is a POST request to the `/submissions` endpoint with the `base64_encoded=true` parameter. It's fairly straight forward. A POST request with some auth headers, and the body of the request is a stringified JSON object that contains a language Id, 93 for JS, 51 for C#, and then the previously created output string that has been base64 encoded. After making this request. The response will be a token, which can be used to see what the output of the submitted code is. While there is a way to get the response from the code automatically without having to go through the token first, according to the docs it isn't as stable as making the second call manually.

The second API call is a GET request to the same `/submissions` endpoint, with the parameters of `?base64_encoded=true&fields=stdout,stderr,status_id,language_id,status,compile_output`. The `fields` parameter is important here, as it changes the shape of the object that gets sent back. The key ones are `stdout`, `stderr`, and `compile_output`. `stdout` is the exact output of the code that was submitted, `stderr` is any error messages that occur after compile time, mainly useful for JavaScript, and `compile_output` are any errors that occur at compile time, mainly useful for C# errors. These all come back base64 encoded, so they need to be decoded if being displayed to the user.

The actual checking if the code passes or not is probably the simplest part of the application. All I am doing is checking if the `stdout` of the API response is equal to the `expectedResult` prop that gets passed into the component. If they match, they pass the quiz.

### Known Bugs:

Currently their are no known bugs. The live deployed site has a limit of 50 API calls per day, so if you don't see any results, open up the dev tools console and check if there any rate limiting related errors. If there are, then check back in 24 hours.

If you encounter any bugs, feel free to submit a detailed issue [here](https://github.com/CalvinPVIII/integrated-code-testing/issues)

### License

2023 [GPLv3](./COPYING.txt)
