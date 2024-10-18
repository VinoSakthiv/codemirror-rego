package trmb.profiles

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
}