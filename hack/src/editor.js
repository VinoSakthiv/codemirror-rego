document.addEventListener("DOMContentLoaded", function () {
  const editorTextArea = document.getElementById("editor");
  const linterTextArea = document.getElementById("linter-area");

  const defaultPolicy = `package trmb.profiles

import future.keywords.if
import future.keywords.in

default allow := false

membership[m] {
    # input.caller_auth.jwt is the user's access token obtained from TID passed
    # in as the "auth" key to the decision endpoint's request body
    user_context_resp := trimble.http.get("https://cloud.stage.api.trimblecloud.com/tcloud-profiles-stage/1.0/profiles/contexts", input.caller_auth.jwt)
    trn := user_context_resp.body.trn
    principal := input.principal
    containers := {item | item := trn[principal].links["member-of"][_]}
    containers[m]
}

allow {
    "trn:profiles:projects:194a24d0-00d9-40ca-a43c-0107a7c776ac" in membership
    "trn:profiles:accounts:a097452d-f4aa-4198-9bc8-dab5eaecb7dc" in membership
}`;
editorTextArea.value = defaultPolicy;
  document.getElementById("runLinter").addEventListener("click", function () {
    const payload = editorTextArea.value;
    fetch("http://localhost:3000/run-linter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.result);
       const linterResult = data.result;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
