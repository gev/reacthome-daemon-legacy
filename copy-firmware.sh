
list=`find ../pic-sensor.X/dist -type f -name pic-sensor.X.production.hex`
for i in $list
do
  name="$(cut -d'/' -f4 <<< $i)"
  cp $i "./firmware/$name.hex"
done
