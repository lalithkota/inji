import React, {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {Icon, Overlay} from 'react-native-elements';
import {Centered, Column, Row, Text, Button} from './ui';
import QRCode from 'react-native-qrcode-svg';
import {Theme} from './ui/styleUtils';
import {useTranslation} from 'react-i18next';
import testIDProps from '../shared/commonUtil';
import {SvgImage} from './ui/svg';
import {NativeModules} from 'react-native';
import {VerifiableCredential} from '../machines/VerifiableCredential/VCMetaMachine/vc';
import RNSecureKeyStore, {ACCESSIBLE} from 'react-native-secure-key-store';
import {DEFAULT_ECL} from '../shared/constants';
import {VCMetadata} from '../shared/VCMetadata';
import {shareImageToAllSupportedApps} from '../shared/sharing/sharing-image-utils';
import {ShareOptions} from 'react-native-share';

export const QrCodeOverlay: React.FC<QrCodeOverlayProps> = props => {
  const {RNPixelpassModule} = NativeModules;
  const {t} = useTranslation('VcDetails');
  const [qrString, setQrString] = useState('');
  const [qrError, setQrError] = useState(false);

  async function getQRData(): Promise<string> {
    let qrData: string;
    try {
      qrData = await RNSecureKeyStore.get(props.meta.id);
    } catch {
      qrData = await RNPixelpassModule.generateQRData(
        JSON.stringify(props.verifiableCredential),
        '',
      );
      await RNSecureKeyStore.set(props.meta.id, qrData, {
        accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      });
    }
    return qrData;
  }

  const [base64String, setBase64String] = useState('');

  let qrRef = useRef(null);

  function updateBase64() {
    qrRef.current.toDataURL(dataURL => {
      setBase64String(`data:image/png;base64,${dataURL}`);
    });
    shareQRCode();
  }

  useEffect(() => {
    shareQRCode();
  }, [base64String]);

  async function shareQRCode() {
    if (base64String != '') {
      const options: ShareOptions = {
        message: 'Scan to view credentials',
        url: base64String,
      };
      let shareStatus = await shareImageToAllSupportedApps(options);
      if (!shareStatus) {
        console.log('Error while sharing QR code::');
      }
    }
  }

  function onQRError() {
    console.warn('Data is too big');
    setQrError(true);
  }

  useEffect(() => {
    (async () => {
      const qrData = await getQRData();
      setQrString(qrData);
    })();
  }, []);
  const [isQrOverlayVisible, setIsQrOverlayVisible] = useState(false);

  const toggleQrOverlay = () => setIsQrOverlayVisible(!isQrOverlayVisible);
  return (
    qrString != '' &&
    !qrError && (
      <React.Fragment>
        <View testID="qrCodeView" style={Theme.QrCodeStyles.QrView}>
          <Pressable
            {...testIDProps('qrCodePressable')}
            accessible={false}
            onPress={toggleQrOverlay}>
            <QRCode
              {...testIDProps('qrCode')}
              size={72}
              value={qrString}
              backgroundColor={Theme.Colors.QRCodeBackgroundColor}
              ecl={DEFAULT_ECL}
              onError={onQRError}
            />
            <View
              testID="magnifierZoom"
              style={[Theme.QrCodeStyles.magnifierZoom]}>
              {SvgImage.MagnifierZoom()}
            </View>
          </Pressable>
        </View>

        <Overlay
          isVisible={isQrOverlayVisible}
          onBackdropPress={toggleQrOverlay}
          overlayStyle={{padding: 1, borderRadius: 21}}>
          <Column style={Theme.QrCodeStyles.expandedQrCode}>
            <Row pY={20} style={Theme.QrCodeStyles.QrCodeHeader}>
              <Text
                testID="qrCodeHeader"
                align="center"
                style={Theme.TextStyles.header}
                weight="bold">
                {t('qrCodeHeader')}
              </Text>
              <Icon
                {...testIDProps('qrCodeCloseIcon')}
                name="close"
                onPress={toggleQrOverlay}
                color={Theme.Colors.Details}
                size={32}
              />
            </Row>
            <Centered testID="qrCodeDetails" pY={30}>
              <QRCode
                {...testIDProps('qrCodeExpandedView')}
                size={300}
                value={qrString}
                backgroundColor={Theme.Colors.QRCodeBackgroundColor}
                ecl={DEFAULT_ECL}
                onError={onQRError}
                getRef={data => (qrRef.current = data)}
              />
              <Button
                testID="share"
                margin="30 0 0 0"
                title={t('share_qr_code')}
                type="gradient"
                icon={
                  <Icon
                    name="share-variant-outline"
                    type="material-community"
                    size={24}
                    color="white"
                  />
                }
                onPress={updateBase64}
              />
            </Centered>
          </Column>
        </Overlay>
      </React.Fragment>
    )
  );
};

interface QrCodeOverlayProps {
  verifiableCredential: VerifiableCredential;
  meta: VCMetadata;
}
