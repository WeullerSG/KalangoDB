import * as Location from "expo-location";

export async function GetLocalization() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de localização negada");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude } = position.coords;

  const [enderecoInfo] = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  const partes = [
    enderecoInfo.street,
    enderecoInfo.streetNumber,
    enderecoInfo.city,
    enderecoInfo.region,
  ].filter(Boolean);

  const endereco = partes.join(", ");

  return {
    lat: latitude,
    lng: longitude,
    endereco: endereco || undefined,
    cep: enderecoInfo?.postalCode ?? undefined,
  };
}
