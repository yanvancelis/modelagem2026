import bpy
import sys

output = sys.argv[-1]

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=output,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_yup=True,
)

print(f"Exported to {output}")
