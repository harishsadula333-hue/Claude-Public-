# How Do Vehicles Run on Liquid Fuel? 3D reel (Telugu, ~73 s)

**Final video:** `output/engine-telugu.mp4` (1080×1920, 30 fps). There is no follow-us outro.

## Facts covered
All are standard engine science, simplified:
- Fuel doesn't push the vehicle. Burning it releases chemical energy: 1 litre of petrol holds about 9 kWh (≈ 9 electricity "units"; about 34 MJ/L).
- Liquid burns slowly, only at its surface, so the injector atomises fuel into a fine mist mixed with air.
- **Four-stroke cycle:**
  1. **Intake:** the piston goes down and draws in the mixture.
  2. **Compression:** the piston comes up and squeezes it.
  3. **Power:** the spark plug ignites it and the expanding gas pushes the piston down.
  4. **Exhaust:** the piston pushes the burnt gas out.
- The crankshaft turns the up-and-down motion into rotation, and gears and the chain drive the wheels. At 3000 RPM a single cylinder fires 25 times a second.
- Diesel engines have no spark plug: compressed air exceeds about 500 °C and the injected diesel self-ignites (compression ignition).
- Diesel gives more torque and better efficiency, so buses, lorries and tractors use it. Most bikes and cars use lighter, smoother, higher-revving petrol engines.

## How it's made
- **3D:** three.js, rendered frame by frame (`src/scene.js`). It has a road scene with a bike, cars, a bus, a lorry and a tractor; a fuel bottle with an energy burst; an injector turning a stream into mist; and a cutaway single-cylinder engine with real slider-crank kinematics, timed valves, spark, flame kernel, explosion and exhaust. The drive scene shows the crank, chain and wheel, and the diesel scene shows compression heating and self-ignition.
- **Voice:** Gemini TTS (voice *Achird*) with DTW-aligned captions.
- **Audio:** synthesized music plus engine effects (idle, rev, intake, compression, spark, bang, exhaust, pass-bys).
