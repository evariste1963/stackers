***** expo-file-system  + store the URI in SQLite.   *****



import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const captureAndSave = async () => {
  const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  if (!result.canceled) {
    const filename = `${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + 'images/' + filename;

    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + 'images/',
      { intermediates: true }
    );

    await FileSystem.moveAsync({ from: result.assets[0].uri, to: dest });

    // Save `dest` (the URI string) into your SQLite DB
    await db.runAsync('INSERT INTO photos (uri) VALUES (?)', [dest]);
  }
};

***** to display the images *****

<Image source={{ uri: photoUri }} style={{ width: 200, height: 200 }} />
