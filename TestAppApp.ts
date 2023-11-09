import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IMessageExtender,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { AppMethod, IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms/IRoom';
import { IFileUploadContext, IPreFileUpload } from '@rocket.chat/apps-engine/definition/uploads';
import { IUser } from '@rocket.chat/apps-engine/definition/users/IUser';
import { PhoneCommand } from './commands/PhoneCommand';
import { StatusUpdateCmd } from './commands/StatusUpdateCmd';
import { ExtendMessageCommand } from './commands/ExtendMessageCommand';

export class TestAppApp extends App implements IPreFileUpload {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        logger.debug('Hello, World!');
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        configuration.slashCommands.provideSlashCommand(new PhoneCommand());
        configuration.slashCommands.provideSlashCommand(new StatusUpdateCmd());
        configuration.slashCommands.provideSlashCommand(new ExtendMessageCommand());
    }

    public async [AppMethod.EXECUTE_PRE_FILE_UPLOAD](context: IFileUploadContext, read: IRead, http: IHttp, persis: IPersistence, modify: IModify): Promise<void> {
        console.log('ContentInspectionExampleAppApp - File Uploaded - Name: ' + context.file.name);
        console.log('ContentInspectionExampleAppApp - File Uploaded - Type: ' + context.file.type);
        console.log('ContentInspectionExampleAppApp - File Uploaded - Size: ' + context.file.size);
 

        if (context.file.type == 'text/plain') {
            console.log('ContentInspectionExampleAppApp - File Uploaded - Content: ' +
                String.fromCharCode.apply(null, context.content));
        }

        const user = await read.getUserReader().getById(context.file.userId);
        const room = await read.getRoomReader().getById(context.file.rid);
        if (room) {
            await this.notifyMessage(room, read, user, 'File inspected - Check logs');
        }
    }

    private async notifyMessage(room: IRoom, read: IRead, sender: IUser, message: string): Promise<void> {
        const notifier = read.getNotifier();
        const messageBuilder = notifier.getMessageBuilder();
        messageBuilder.setText(message);
        messageBuilder.setRoom(room);
        return notifier.notifyUser(sender, messageBuilder.getMessage());
    }

}