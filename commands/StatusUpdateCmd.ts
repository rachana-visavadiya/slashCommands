import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

export class StatusUpdateCmd implements ISlashCommand {
    public command = 'setStatus';
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;
    
    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();
        
        if (!params || params.length == 0) {
            return this.notifyMessage(room, read, user, "At least one status argument is mandatory. A second argument can be passed as status text.");
        }
        
        let status = params[0];
        let statusText = params.length > 1 ? params.slice(1).join(' ') : '';
        
        await modify.getUpdater().getUserUpdater().updateStatus(user, statusText, status);
        await this.notifyMessage(room, read, user, "Status updated to " + status + " (" + statusText + ").");
    }

    private async notifyMessage(room: IRoom, read: IRead, sender: IUser, message: string): Promise<void> {
        const notifier = read.getNotifier();
        const messageBuilder = notifier.getMessageBuilder();
        messageBuilder.setText(message);
        messageBuilder.setRoom(room);
        return notifier.notifyUser(sender, messageBuilder.getMessage());
    }
 }
 