import { IHttp, IModify, IPersistence, IRead, IMessageExtender } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { ImageAttachment } from '../ImageAttachment';

export class ExtendMessageCommand implements ISlashCommand{
    public command = 'extend-message';
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const messageId = await this.sendMessage(context, modify, 'Sending a message!'); // [1]
        const messageExtender = await this.getMessageExtender(context, modify, messageId); // [2]
        const value = 1;
        const img = new ImageAttachment('https://open.rocket.chat/images/logo/logo.svg'); // [3]

        messageExtender.addCustomField('key', value); // [4]
        messageExtender.addAttachment(img); // [5]

        await modify.getExtender().finish(messageExtender); // [6]
    }

    private async sendMessage(context: SlashCommandContext, modify: IModify, message: string): Promise<string> {
        const messageStructure = modify.getCreator().startMessage();
        const sender = context.getSender();
        const room = context.getRoom();

        messageStructure
        .setSender(sender)
        .setRoom(room)
        .setText(message);

        return (await modify.getCreator().finish(messageStructure));
    }
    
    private async getMessageExtender(context: SlashCommandContext, modify: IModify, messageId: string): Promise<IMessageExtender>{
        const sender = context.getSender();
        return modify.getExtender().extendMessage(messageId, sender);
    }
}
