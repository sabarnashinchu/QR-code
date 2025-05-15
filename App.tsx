import { useState } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Image,
  Text,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function App() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const generateQRCode = async () => {
    if (!text) {
      toast({
        title: 'Error',
        description: 'Please enter some text',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/generate-qr`, { text });
      setQrCode(response.data.qrCode);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('qrImage', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/decode-qr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setDecodedText(response.data.text);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to decode QR code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" py={12} px={4} bg="gray.50">
        <VStack spacing={8} maxW="container.md" mx="auto">
          <Heading>QR Code Generator & Scanner</Heading>
          
          <Tabs isFitted variant="enclosed" width="100%">
            <TabList mb="1em">
              <Tab>Generate QR Code</Tab>
              <Tab>Scan QR Code</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} width="100%">
                  <Input
                    placeholder="Enter text or URL"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <Button
                    colorScheme="blue"
                    onClick={generateQRCode}
                    isLoading={loading}
                    width="100%"
                  >
                    Generate QR Code
                  </Button>
                  {qrCode && (
                    <Box
                      borderWidth={1}
                      borderRadius="lg"
                      p={4}
                      bg="white"
                      width="100%"
                    >
                      <Image src={qrCode} alt="QR Code" mx="auto" />
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} width="100%">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    p={1}
                  />
                  {decodedText && (
                    <Box
                      borderWidth={1}
                      borderRadius="lg"
                      p={4}
                      bg="white"
                      width="100%"
                    >
                      <Text fontWeight="bold">Decoded Text:</Text>
                      <Text>{decodedText}</Text>
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App; 