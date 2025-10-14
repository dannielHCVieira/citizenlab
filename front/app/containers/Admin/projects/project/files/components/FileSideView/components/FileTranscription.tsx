import React, { useMemo } from 'react';

import {
  Box,
  Text,
  Spinner,
  Accordion,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import useFileTranscript from 'api/file_transcript/useFileTranscript';
import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import { AudioRef } from '../../FilePreview';
import messages from '../../messages';
import Centerer from 'components/UI/Centerer';

const timecodeFormat = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const Timecode = ({ timecode, onClick }) => {
  return (
    <Text
      color="textSecondary"
      fontSize="s"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: onClick ? 'underline' : 'none',
      }}
      onClick={onClick}
    >
      {timecodeFormat(timecode)}
    </Text>
  );
};

type Props = {
  file: IFileData;
  audioRef?: React.RefObject<AudioRef>;
  currentAudioTime?: number;
};
const FileTranscription = ({ file, audioRef, currentAudioTime }: Props) => {
  const { formatMessage } = useIntl();
  const { data: fileTranscript, isError } = useFileTranscript(file.id);

  const transcriptionStatus = fileTranscript?.data.attributes.status;

  const handleTimecodeClick = (milliseconds: number) => {
    if (audioRef?.current) {
      const seconds = milliseconds / 1000;
      audioRef.current.setCurrentTime(seconds);
      // Play the audio if it's paused
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  // Calculate which utterance is currently active based on audio time
  const activeUtteranceIndex = useMemo(() => {
    if (currentAudioTime === undefined) return null;

    const utterances =
      fileTranscript?.data.attributes.assemblyai_transcript?.utterances;

    if (!utterances) return null;

    const currentTimeMs = currentAudioTime * 1000;
    const index = utterances.findIndex(
      (utterance) =>
        currentTimeMs >= utterance.start && currentTimeMs < utterance.end
    );

    return index !== -1 ? index : null;
  }, [currentAudioTime, fileTranscript]);

  // Calculate which chapter is currently active based on audio time
  const activeChapterIndex = useMemo(() => {
    if (currentAudioTime === undefined) return null;

    const chapters =
      fileTranscript?.data.attributes.assemblyai_transcript?.chapters;

    if (!chapters) return null;

    const currentTimeMs = currentAudioTime * 1000;
    const index = chapters.findIndex(
      (chapter) => currentTimeMs >= chapter.start && currentTimeMs < chapter.end
    );

    return index !== -1 ? index : null;
  }, [currentAudioTime, fileTranscript]);

  return (
    <>
      <Title variant="h3">{formatMessage(messages.transcription)}</Title>
      <Box pt="12px" display="flex">
        {(transcriptionStatus === 'pending' ||
          transcriptionStatus === 'processing') && (
          <Box ml="4px" display="flex">
            <Centerer width="32px">
              <Spinner size="16px" />
            </Centerer>
            {formatMessage(messages.transcriptionPending)}
          </Box>
        )}
      </Box>

      {transcriptionStatus === 'completed' && (
        <>
          {fileTranscript?.data.attributes.assemblyai_transcript?.chapters && (
            <Box>
              <Title variant="h4" mt="16px">
                {formatMessage(messages.transcriptionChapters)}
              </Title>
              {fileTranscript.data.attributes.assemblyai_transcript.chapters.map(
                (chapter, index) => (
                  <Accordion
                    key={chapter.start}
                    bgColor={
                      activeChapterIndex === index
                        ? colors.green100
                        : 'transparent'
                    }
                    title={
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="8px"
                        p="4px"
                        borderRadius="4px"
                      >
                        <Timecode
                          timecode={chapter.start}
                          onClick={
                            audioRef
                              ? () => handleTimecodeClick(chapter.start)
                              : undefined
                          }
                        />
                        <Title variant="h5" p="0" m="0">
                          {chapter.gist}
                        </Title>
                      </Box>
                    }
                  >
                    {chapter.summary}
                  </Accordion>
                )
              )}
            </Box>
          )}

          {fileTranscript?.data.attributes.assemblyai_transcript
            ?.utterances && (
            <Box mt="8px">
              {fileTranscript.data.attributes.assemblyai_transcript.utterances.map(
                (utterance, index) => (
                  <Box
                    key={utterance.start}
                    bgColor={
                      activeUtteranceIndex === index
                        ? colors.green100
                        : 'transparent'
                    }
                    p="8px"
                    borderRadius="4px"
                    mb="4px"
                  >
                    <Box display="flex" alignItems="center" gap="8px">
                      <Timecode
                        timecode={utterance.start}
                        onClick={
                          audioRef
                            ? () => handleTimecodeClick(utterance.start)
                            : undefined
                        }
                      />
                      <Title variant="h6" p="0" m="0">
                        {formatMessage(messages.speakerA, {
                          speaker: utterance.speaker,
                        })}
                      </Title>
                    </Box>
                    <Text key={index} color="textSecondary" fontSize="s">
                      {utterance.text}
                    </Text>
                  </Box>
                )
              )}
            </Box>
          )}
        </>
      )}
      {(transcriptionStatus === 'failed' || isError) && (
        <Text color="textSecondary" fontSize="s">
          {formatMessage(messages.unableToGenerateTranscription)}
        </Text>
      )}
    </>
  );
};

export default FileTranscription;
