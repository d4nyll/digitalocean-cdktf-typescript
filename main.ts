import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { DataDigitaloceanSshKey, DigitaloceanProvider, Droplet, Loadbalancer } from "./.gen/providers/digitalocean"

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

    new Loadbalancer(this, 'lb', {
      name: 'default',
      region: 'lon1',
      algorithm: 'round_robin',
      forwardingRule: [{
        entryProtocol: 'http',
        entryPort: 80,
        targetProtocol: 'http',
        targetPort: 80,
      }],
      dropletIds: droplets.map((droplet) => Fn.tonumber(droplet.id))
    })
  }
}

const app = new App();
new MyStack(app, "infra");
app.synth();
