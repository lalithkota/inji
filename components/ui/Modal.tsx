import React from 'react';
import { I18nManager, Modal as RNModal, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Column, Row, Text } from '.';
import { ElevationLevel, Theme } from './styleUtils';

export const Modal: React.FC<ModalProps> = (props) => {
  return (
    <RNModal
      animationType="slide"
      style={Theme.ModalStyles.modal}
      visible={props.isVisible}
      onShow={props.onShow}
      onRequestClose={props.onDismiss}>
      <Column fill safe align="center">
        <Row elevation={props.headerElevation}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 18,
              marginVertical: 15,
            }}>
            {props.headerRight ? (
              <Icon
                name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
                onPress={props.onDismiss}
                color={Theme.Colors.Icon}
              />
            ) : null}
            {props.arrowLeft ? (
              <Icon
                name="arrow-left"
                type="material-community"
                onPress={props.onDismiss}
                containerStyle={Theme.Styles.IconContainer}
                color={Theme.Colors.Icon}
              />
            ) : null}
            <Row
              fill
              align={props.headerLeft ? 'flex-start' : 'center'}
              margin={'12 0 0 0'}>
              <Column>
                <Text style={Theme.TextStyles.header}>
                  {props.headerTitle || props.headerLeft}
                </Text>
                <Text
                  weight="semibold"
                  style={Theme.TextStyles.small}
                  color={
                    props.headerLabelColor
                      ? props.headerLabelColor
                      : Theme.Colors.profileLanguageValue
                  }>
                  {props.headerLabel}
                </Text>
              </Column>
            </Row>
            {props.headerRight || props.arrowLeft || (
              <Icon
                name="close"
                onPress={props.onDismiss}
                color={Theme.Colors.Details}
                size={27}
              />
            )}
          </View>
        </Row>
        {props.children}
      </Column>
    </RNModal>
  );
};

export interface ModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  headerTitle?: string;
  headerElevation?: ElevationLevel;
  headerLabel?: string;
  headerLabelColor?: string;
  headerRight?: React.ReactElement;
  headerLeft?: React.ReactElement;
  arrowLeft?: React.ReactElement;
  onShow?: () => void;
}
