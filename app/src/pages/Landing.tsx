import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { transcribeFile } from '../state/transcribe';
import { TitleBar } from '../components/TitleBar';
import { AppContainer, MainCenterColumn } from '../components/Util';
import styled from 'styled-components';
import { openModelManager } from '../state/nav';
import { resetTour } from '../components/Tour';
import {
  Button,
  CommentIcon,
  IconButton,
  SettingsIcon,
  Tooltip,
  Text,
  Heading,
} from 'evergreen-ui';
import { LandingTour } from '../tour/LandingTour';
import { openDocumentFromDisk, openDocumentFromMemory } from '../state/editor/io';
import { emptyDocument } from '../core/document';
import { MenuBar, MenuGroup, MenuItem } from '../components/MenuBar';
import { RootState } from '../state';

const BottomRightContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 10px;
  & > * {
    margin: 5px;
  }
`;

export function LandingPage(): JSX.Element {
  const connected = useSelector(
    (state: RootState) => state.server.servers[state.server.selectedServer]
  );

  return <AppContainer>{connected ? <LandingContent /> : <ConnectingContent />}</AppContainer>;
}

function ConnectingContent(): JSX.Element {
  return (
    <>
      <TitleBar />
      <MainCenterColumn>
        <Heading>Connecting to server...</Heading>
        <p />
        <Text>This should only take a few seconds</Text>
      </MainCenterColumn>
    </>
  );
}

function LandingContent(): JSX.Element {
  const dispatch = useDispatch();

  return (
    <>
      <MenuBar>
        <MenuGroup label={'File'}>
          <MenuItem
            callback={() => dispatch(openDocumentFromDisk())}
            accelerator={'CommandOrControl+O'}
            label={'Open'}
          />
          <MenuItem
            callback={() => dispatch(transcribeFile())}
            accelerator={'CommandOrControl+I'}
            label={'Import & Transcribe'}
          />
          <MenuItem
            callback={() => dispatch(openDocumentFromMemory(emptyDocument))}
            accelerator={'CommandOrControl+Shift+N'}
            label={'New blank document'}
          />
        </MenuGroup>
      </MenuBar>

      <LandingTour />
      <TitleBar />
      <MainCenterColumn>
        <Button
          appearance="primary"
          onClick={() => dispatch(transcribeFile())}
          id={'import' /* for tour */}
          size={'large'}
          marginY={5}
          width={300}
        >
          Import & Transcribe
        </Button>
        <Button
          appearance="primary"
          onClick={() => dispatch(openDocumentFromDisk())}
          size={'large'}
          marginY={5}
          width={300}
        >
          Open Existing
        </Button>
        <Button
          onClick={() => dispatch(openDocumentFromMemory(emptyDocument))}
          size={'large'}
          marginY={20}
          width={300}
        >
          New Blank Document
        </Button>
      </MainCenterColumn>
      <BottomRightContainer>
        <Tooltip content="restart help tour">
          <IconButton icon={CommentIcon} onClick={() => resetTour()} />
        </Tooltip>
        <Tooltip content="manage transcription models">
          <IconButton icon={SettingsIcon} onClick={() => dispatch(openModelManager())} />
        </Tooltip>
      </BottomRightContainer>
    </>
  );
}
