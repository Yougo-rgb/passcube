#include <SoftwareSerial.h>

SoftwareSerial HM10(2, 3);

void setup()
{
  Serial.begin(9600);
  HM10.begin(9600);

  Serial.println("HM-10 AT mode");
}

void loop()
{
  if (Serial.available())
  {
    HM10.write(Serial.read());
  }

  if (HM10.available())
  {
    Serial.write(HM10.read());
  }
}