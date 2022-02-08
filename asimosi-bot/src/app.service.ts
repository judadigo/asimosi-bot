import { Injectable, Logger } from '@nestjs/common';
import * as NodeIRC from 'irc';
import { environments } from './environments';

@Injectable()
export class AppService {

  private readonly logger = new Logger(AppService.name);

  private client: NodeIRC.Client;
  private usersInChannel: {[key:string]: string[]} = {};
  public lastKick = 0;

  constructor() {
    this.client = new NodeIRC.Client(environments.bot.server, environments.bot.botName, {
      channels: environments.bot.channels
    });
    this.init();
  }

  init(): void {
    this.logger.debug('Starting bot');
    this.client.on('registered', () => {
      this.client.say('NickServ', 'identify ' + environments.bot.password);
    });
    this.client.addListener('join', function(channel, who) {
      if(this.clearNick(who) != environments.bot.botName) {
        this.usersInChannel[channel].append(who);
      }
    });
    this.client.addListener('part', function(channel, who, reason) {
      if(this.clearNick(who) != environments.bot.botName) {
        const index = this.usersInChannel[channel].indexOf(who);
        this.usersInChannel[channel].splice(index, 1);
      }
    });
    this.client.addListener('kick', function(channel, who, by, reason) {
      if(this.clearNick(who) != environments.bot.botName) {
        const index = this.usersInChannel[channel].indexOf(who);
        this.usersInChannel[channel].splice(index, 1);
      }
    });
    this.client.on('nick', (oldnick, newnick, channels, message) => {
      if(oldnick == environments.bot.botName) {
          environments.bot.botName = newnick;
      }
    });
    this.client.on('names', (channel, nicks) => {
      this.usersInChannel[channel] = nicks;
    });
    this.client.addListener('message', (from, to, message: string) => {
      if (to.match(/^[#&]/)) {
        const user = from;
        const now = new Date();
        if(message.indexOf(environments.bot.rulette.command) === 0) {
          if(this.lastKick > now.getTime() - environments.bot.rulette.cooldown) {
            const args = message.split(' ');
            const quantity = args.length > 1 && parseInt(args[1]) > 0 ? parseInt(args[1]) : 1;
            const qttyInChannel = this.usersInChannel[to].length;
            for(let i; i<quantity; i++)  {
              const randomIdx = this.random(0, qttyInChannel - 1);
              this.logger.debug(`kicking ${this.usersInChannel[to][randomIdx]} from channel ${to}`);
              this.client.send('kick', to, this.usersInChannel[to][randomIdx]);
            }
          } else {
            this.client.say(to, `${user} nope, debes esperar unos segundos`);
          }
        }
      } else {
        // pm
        if(message.indexOf(environments.bot.join.command) === 0) {
          const args = message.split(' ');
          if(args.length > 1) {
            this.client.join(args[1]);
          } else {
            this.client.say(from, `Debes poner "${environments.bot.join.command} #canal" para saber donde unirme`);
          }
        }
      }
    });
    this.client.addListener('error', (message) => {
      this.logger.error('IRC Error', message);
    });
  }

  private clearNick(nick: string): string {
    if(['&', '~', '@', '+'].includes(nick[0])) {
      return nick.substring(1);
    }
    return nick;
  }

  private random(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

}
