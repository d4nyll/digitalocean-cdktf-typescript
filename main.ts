import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { DigitaloceanProvider } from "./.gen/providers/digitalocean"

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new DigitaloceanProvider(this, 'provider')
    
  }
}

const app = new App();
new MyStack(app, "infra");
app.synth();
