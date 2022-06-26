import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { DataDigitaloceanSshKey, DigitaloceanProvider, Droplet } from "./.gen/providers/digitalocean"

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new DigitaloceanProvider(this, 'provider')

    const dropletNames = ['foo', 'bar']
    const sshKey = new DataDigitaloceanSshKey(this, 'sshKey', {
      name: 'do_cdktf',
    })
    const droplets = dropletNames.map(name => new Droplet(this, name, {
        image: 'ubuntu-20-04-x64',
        name,
        region: 'lon1',
        size: 's-1vcpu-1gb',
        sshKeys: [sshKey.id.toString()],
        userData: `#!/bin/bash

apt-get -y update
apt-get -y install nginx
export HOSTNAME=$(curl -s http://169.254.169.254/metadata/v1/hostname)
export PUBLIC_IPV4=$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)
echo Droplet: $HOSTNAME, IP Address: $PUBLIC_IPV4 > /var/www/html/index.html
`
      })
    )
  }
}

const app = new App();
new MyStack(app, "infra");
app.synth();
