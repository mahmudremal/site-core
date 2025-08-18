import BasicTextEditor from './basic-text-editor';
import BasicImage from './basic-image';
import BasicButton from './basic-button';
import BasicSpacer from './basic-spacer';
import BasicDivider from './basic-divider';
import BasicVideo from './basic-video';
import BasicSocials from './basic-socials';
import BasicHeading from './basic-heading';
import BasicBlackQuota from './basic-blackquota';
import BasicHTML from './basic-html';
import BasicPosts from './basic-posts';
import BasicPricingTable from './basic-pricing-table';
import BasicShortcode from './basic-shortcode';
import BasicContainer from './basic-container';

export const placeHolderElements = [
    // {id: 'text-1', type: 'text-editor', data: {content: {textcontent: [{id: 'text', value: 'A quick brown fox jumps over the lazy dog.'}]}}},
];

export const editorAddons = [
    new BasicContainer(),
    new BasicBlackQuota(),
    new BasicButton(),
    new BasicHeading(),
    new BasicHTML(),
    new BasicImage(),
    new BasicPosts(),
    new BasicPricingTable(),
    new BasicShortcode(),
    new BasicSocials(),
    new BasicVideo(),
    new BasicDivider(),
    new BasicSpacer(),
    new BasicTextEditor(),
];
