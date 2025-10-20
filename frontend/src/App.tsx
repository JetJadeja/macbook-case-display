import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";

/**
 * CaseCanvas Application
 *
 * Simple name input form for e-ink display
 */
function App() {
  const [name, setName] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  /**
   * Handle name form submission
   */
  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (name.trim()) {
      console.log("Submitted name:", name);
      setSubmitted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setName("");
        setSubmitted(false);
      }, 3000);
    }
  };

  // Show success message after submission
  if (submitted) {
    return (
      <div className="App min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Sent Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your name has been submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-medium">From: {name}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show name input form
  return (
    <div className="App min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">CaseCanvas</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">What's your name?</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                required
                autoFocus
                className="text-base"
              />
            </div>

            <Button type="submit" className="w-full text-base h-11">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
