import bpy
import sys

output = sys.argv[-1]

for obj in bpy.data.objects:
    obj.select_set(obj.visible_get())

bpy.ops.export_scene.gltf(
    filepath=output,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
)

print(f"Exported to {output}")
