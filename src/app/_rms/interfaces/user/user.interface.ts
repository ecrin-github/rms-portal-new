import { AddressInterface } from './address.interface';
import { SocialNetworksInterface } from './social-networks.interface';
import { AuthInterface } from './auth.interface';

export interface UserInterface {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  pic: string;
  role: number;
  occupation: string;
  companyName: string;
  phone: string;
  address?: AddressInterface;
  socialNetworks?: SocialNetworksInterface;
  // personal information
  firstName: string;
  lastName: string;
  website: string;
  // account information
  language: string;
  timeZone: string;
  communication: {
    email: boolean,
    sms: boolean,
    phone: boolean
  };
  // email settings
  emailSettings: {
    emailNotification: boolean,
    sendCopyToPersonalEmail: boolean,
    activityRelatesEmail: {
      youHaveNewNotifications: boolean,
      youAreSentADirectMessage: boolean,
      someoneAddsYouAsAsAConnection: boolean,
    }
  };
  token: AuthInterface;
}
